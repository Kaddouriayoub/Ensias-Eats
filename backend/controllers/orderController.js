import QRCode from 'qrcode';
import { Order, Meal, User, Wallet, Transaction, TimeSlot, WellnessTracking } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (student)
const createOrder = asyncHandler(async (req, res) => {
  console.log('=== CREATE ORDER REQUEST ===');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.user:', req.user);

  const { items, pickupTimeSlot, paymentMethod, specialInstructions } = req.body;

  if (!items || items.length === 0) {
    throw new ErrorResponse('Please add items to your order', 400);
  }

  // Time slot is now optional for testing
  // if (!pickupTimeSlot) {
  //   throw new ErrorResponse('Please select a pickup time slot', 400);
  // }

  // Get user with wallet
  const user = await User.findById(req.user.id).populate('wallet');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Verify user completed onboarding
  if (!user.onboardingCompleted) {
    throw new ErrorResponse('Please complete onboarding first', 403);
  }

  // Build order items with meal details
  const orderItems = [];
  let totalPrice = 0;
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;

  for (const item of items) {
    const meal = await Meal.findById(item.mealId);

    if (!meal) {
      throw new ErrorResponse(`Meal with ID ${item.mealId} not found`, 404);
    }

    if (!meal.isAvailableToday()) {
      throw new ErrorResponse(`${meal.name} is not available today`, 400);
    }

    const quantity = item.quantity || 1;
    const itemPrice = meal.price * quantity;

    orderItems.push({
      meal: meal._id,
      quantity,
      price: meal.price,
      nutritionalInfo: {
        calories: meal.nutritionalInfo.calories,
        proteins: meal.nutritionalInfo.proteins,
        carbohydrates: meal.nutritionalInfo.carbohydrates
      }
    });

    totalPrice += itemPrice;
    totalCalories += meal.nutritionalInfo.calories * quantity;
    totalProteins += meal.nutritionalInfo.proteins * quantity;
    totalCarbs += meal.nutritionalInfo.carbohydrates * quantity;
  }

  // Parse pickup time (if provided)
  let pickupStart = null;
  let pickupEnd = null;
  let timeSlot = null;

  if (pickupTimeSlot) {
    pickupStart = new Date(pickupTimeSlot);
    pickupEnd = new Date(pickupStart.getTime() + 30 * 60000); // 30 minutes window

    // Check time slot availability
    timeSlot = await TimeSlot.findById(req.body.timeSlotId);
    if (timeSlot && !timeSlot.isAvailableForBooking()) {
      throw new ErrorResponse('Selected time slot is full', 400);
    }
  }

  // Validate payment method
  const wallet = user.wallet;

  if (paymentMethod === 'wallet') {
    if (!wallet || !wallet.canAfford(totalPrice)) {
      throw new ErrorResponse('Insufficient wallet balance', 400);
    }
  }

  // Check budget warning (don't block, just warn)
  let budgetWarning = null;
  if (wallet && wallet.exceedsBudget(totalPrice)) {
    budgetWarning = `This order will exceed your monthly budget by ${(user.currentMonthSpent + totalPrice - user.monthlyBudgetCap).toFixed(2)} DHS`;
  }

  // Create order
  console.log('Creating order with data:', {
    student: user._id,
    items: orderItems,
    totalPrice,
    totalCalories,
    totalProteins,
    totalCarbs,
    pickupTimeSlot: pickupStart,
    pickupTimeEnd: pickupEnd,
    paymentMethod
  });

  let order;
  try {
    order = await Order.create({
      student: user._id,
      items: orderItems,
      totalPrice,
      totalCalories,
      totalProteins,
      totalCarbs,
      pickupTimeSlot: pickupStart,
      pickupTimeEnd: pickupEnd,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' ? 'pending' : 'pending',
      specialInstructions: specialInstructions || '',
      status: 'pending'
    });
    console.log('Order created successfully:', order._id);
  } catch (error) {
    console.error('Order creation failed:', error);
    console.error('Validation errors:', error.errors);
    throw new ErrorResponse(error.message || 'Failed to create order', 400);
  }

  // Generate QR code
  const qrData = JSON.stringify({
    orderId: order._id,
    orderNumber: order.orderNumber,
    studentId: user._id
  });

  const qrCode = await QRCode.toDataURL(qrData);
  order.qrCode = qrCode;
  await order.save();

  // Process payment if wallet
  if (paymentMethod === 'wallet') {
    await wallet.deductFunds(totalPrice);
    order.paymentStatus = 'paid';
    await order.save();

    // Create transaction record
    await Transaction.create({
      wallet: wallet._id,
      user: user._id,
      type: 'debit',
      amount: totalPrice,
      description: `Order ${order.orderNumber}`,
      order: order._id,
      paymentMethod: 'wallet',
      balanceAfter: wallet.balance
    });

    // Update user's monthly spending
    user.currentMonthSpent += totalPrice;
    await user.save();

    // Update wellness tracking immediately for paid orders
    try {
      console.log(`🔄 Processing wellness tracking for new paid order ${order._id}`);
      const tracking = await WellnessTracking.getTodayTracking(user._id);

      console.log(`📈 Before update - Daily: ${tracking.dailyCalories} cal, ${tracking.dailyProteins}g protein, ${tracking.dailySpent} DH`);

      await tracking.addOrderStats(
        order.totalCalories || 0,
        order.totalProteins || 0,
        order.totalCarbs || 0,
        order.totalPrice || 0
      );

      order.wellnessProcessed = true;
      await order.save();

      const updatedTracking = await WellnessTracking.findById(tracking._id);
      console.log(`📊 After update - Daily: ${updatedTracking.dailyCalories} cal, ${updatedTracking.dailyProteins}g protein, ${updatedTracking.dailySpent} DH`);
      console.log(`✅ Updated wellness tracking for paid order ${order._id}`);
    } catch (error) {
      console.error(`❌ Error updating wellness tracking for new order ${order._id}:`, error);
      // Don't fail the order creation if wellness tracking fails
    }
  }

  // Increment time slot order count
  if (timeSlot) {
    await timeSlot.incrementOrders();
  }

  // Increment meal order counts
  for (const item of orderItems) {
    const meal = await Meal.findById(item.meal);
    if (meal) {
      await meal.incrementOrderCount();
    }
  }

  // Populate order for response
  await order.populate('items.meal');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    budgetWarning,
    data: order
  });
});

// @desc    Get all orders for logged in user
// @route   GET /api/orders/my-orders
// @access  Private (student)
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;

  let query = { student: req.user.id };

  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.meal');

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.meal')
    .populate('student', 'name email');

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Check authorization
  if (order.student._id.toString() !== req.user.id && !['cafeteria_staff', 'admin'].includes(req.user.role)) {
    throw new ErrorResponse('Not authorized to access this order', 403);
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (student)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Check authorization
  if (order.student.toString() !== req.user.id) {
    throw new ErrorResponse('Not authorized to cancel this order', 403);
  }

  // Check if order can be cancelled
  if (!order.canBeCancelled()) {
    throw new ErrorResponse('Order cannot be cancelled at this stage', 400);
  }

  const { reason } = req.body;

  await order.cancelOrder(reason || 'Cancelled by user');

  // Refund if payment was made
  if (order.paymentStatus === 'paid' && order.paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (wallet) {
      await wallet.addFunds(order.totalPrice);

      // Create refund transaction
      await Transaction.create({
        wallet: wallet._id,
        user: req.user.id,
        type: 'credit',
        amount: order.totalPrice,
        description: `Refund for cancelled order ${order.orderNumber}`,
        order: order._id,
        paymentMethod: 'wallet',
        balanceAfter: wallet.balance,
        status: 'completed'
      });

      order.paymentStatus = 'refunded';
      await order.save();

      // Update user's monthly spending
      const user = await User.findById(req.user.id);
      user.currentMonthSpent -= order.totalPrice;
      await user.save();
    }
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Get all orders (Cafeteria staff/admin)
// @route   GET /api/orders
// @access  Private (cafeteria_staff, admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { status, date } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (date) {
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(requestedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    query.pickupTimeSlot = {
      $gte: requestedDate,
      $lt: nextDay
    };
  }

  const orders = await Order.find(query)
    .sort({ pickupTimeSlot: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.meal')
    .populate('student', 'name email');

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    count: orders.length,
    data: orders,
    pagination: {
      page,
      limit,
      total,
    }
  });
});

// @route   PATCH /api/orders/:id/status
// @access  Private (cafeteria_staff, admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  console.log(`🔍 Updating order ${id} to status: ${status}`);

  if (!status) {
    throw new ErrorResponse('Please provide a status', 400);
  }

  // Find the order and populate the student field
  const order = await Order.findById(id).populate('student', 'email');
  
  if (!order) {
    console.error(`❌ Order not found: ${id}`);
    throw new ErrorResponse('Order not found', 404);
  }

  console.log(`📦 Found order: ${order._id} for user: ${order.student?.email || order.student}`);

  // Update status
  const previousStatus = order.status;
  order.status = status;
  
  // If marked as ready, update notification
  if (status === 'ready') {
    console.log(`📢 Order ${order._id} is now ready for pickup`);
    order.notificationSent.ready = true;
  }

  // Save the order first
  await order.save();
  console.log(`✅ Updated order ${order._id} status to: ${status}`);

  // If marked as completed or paid, update wellness tracking if not already processed
  if ((status === 'completed' || status === 'paid') && !order.wellnessProcessed) {
    try {
      console.log(`🔄 Processing wellness tracking for order ${order._id}`);
      
      // Get the user ID (handling both populated and non-populated student)
      const userId = order.student._id ? order.student._id.toString() : order.student.toString();
      
      // Get or create today's tracking
      console.log(`🔍 Getting or creating wellness tracking for user ID: ${userId}`);
      const tracking = await WellnessTracking.getTodayTracking(userId);
      console.log(`📊 Found wellness tracking for user ID: ${userId}`);
      
      // Log before update
      console.log(`📈 Before update - Daily: ${tracking.dailyCalories} cal, ${tracking.dailyProteins}g protein, ${tracking.dailySpent} DH`);
      console.log(`📈 Before update - Monthly: ${tracking.monthlyCalories} cal, ${tracking.monthlyProteins}g protein, ${tracking.monthlySpent} DH`);
      
      // Update wellness tracking
      await tracking.addOrderStats(
        order.totalCalories || 0,
        order.totalProteins || 0,
        order.totalCarbs || 0,
        order.totalPrice || 0
      );
      
      // Mark as processed
      order.wellnessProcessed = true;
      await order.save();
      
      console.log(`✅ Updated wellness tracking for order ${order._id}: +${order.totalCalories || 0} cal, +${order.totalProteins || 0}g protein, +${order.totalPrice || 0} DH`);
      
      // Verify the update
      const updatedTracking = await WellnessTracking.findById(tracking._id);
      console.log(`📊 After update - Daily: ${updatedTracking.dailyCalories} cal, ${updatedTracking.dailyProteins}g protein, ${updatedTracking.dailySpent} DH`);
      console.log(`📊 After update - Monthly: ${updatedTracking.monthlyCalories} cal, ${updatedTracking.monthlyProteins}g protein, ${updatedTracking.monthlySpent} DH`);
      
    } catch (error) {
      console.error(`❌ Error updating wellness tracking for order ${order._id}:`, error);
      // Don't fail the request if wellness tracking fails
    }
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Mark order as collected (Cafeteria staff)
// @route   PATCH /api/orders/:id/collect
// @access  Private (cafeteria_staff, admin)
const collectOrder = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  // Verify QR code if provided
  if (qrData) {
    try {
      const parsedData = JSON.parse(qrData);
      if (parsedData.orderId !== order._id.toString()) {
        throw new ErrorResponse('Invalid QR code', 400);
      }
    } catch (error) {
      throw new ErrorResponse('Invalid QR code format', 400);
    }
  }

  // Check if order is ready
  if (order.status !== 'ready') {
    throw new ErrorResponse('Order is not ready for collection', 400);
  }

  // Mark as collected
  await order.markAsCollected(req.user.id);

  // Update user's daily nutrition intake
  const user = await User.findById(order.student);
  if (user) {
    user.resetDailyIntake();
    user.dailyCalorieIntake += order.totalCalories;
    user.dailyProteinIntake += order.totalProteins;
    await user.save();
  }

  res.json({
    success: true,
    message: 'Order collected successfully',
    data: order
  });
});

export { createOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  collectOrder
 }