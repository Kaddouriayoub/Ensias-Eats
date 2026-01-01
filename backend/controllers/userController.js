import { User, Wallet, Order, ExternalMeal } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('wallet')
    .select('-password');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Reset daily intake if needed
  user.resetDailyIntake();
  await user.save();

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, nutritionalGoal, monthlyBudgetCap, preferredPaymentMethod } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Update fields
  if (name) user.name = name;
  if (nutritionalGoal) user.nutritionalGoal = nutritionalGoal;
  if (monthlyBudgetCap !== undefined) user.monthlyBudgetCap = monthlyBudgetCap;
  if (preferredPaymentMethod) user.preferredPaymentMethod = preferredPaymentMethod;

  await user.save();

  // Update wallet budget cap if changed
  if (monthlyBudgetCap !== undefined) {
    const wallet = await Wallet.findOne({ user: user._id });
    if (wallet) {
      wallet.monthlyBudgetCap = monthlyBudgetCap;
      await wallet.save();
    }
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Get user dashboard (wellness & budget)
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wallet');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Reset daily intake if needed
  user.resetDailyIntake();
  await user.save();

  // Get today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayOrders = await Order.find({
    student: user._id,
    createdAt: { $gte: today, $lt: tomorrow }
  });

  // Get current active order
  const activeOrder = await Order.findOne({
    student: user._id,
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
  }).sort({ createdAt: -1 });

  // Calculate remaining budget
  const wallet = user.wallet;
  const remainingBudget = wallet ? wallet.getRemainingBudget() : 0;

  res.json({
    success: true,
    data: {
      user: {
        name: user.name,
        email: user.email,
        nutritionalGoal: user.nutritionalGoal
      },
      nutrition: {
        dailyCalories: user.dailyCalorieIntake,
        dailyProteins: user.dailyProteinIntake,
        lastReset: user.lastIntakeReset
      },
      budget: {
        monthlyBudgetCap: user.monthlyBudgetCap,
        currentMonthSpent: user.currentMonthSpent,
        remainingBudget,
        walletBalance: wallet ? wallet.balance : 0
      },
      orders: {
        todayCount: todayOrders.length,
        activeOrder
      }
    }
  });
});

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
export const getOrderHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ student: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.meal');

  const total = await Order.countDocuments({ student: req.user.id });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Add external meal (consumed outside cafeteria)
// @route   POST /api/users/external-meals
// @access  Private
export const addExternalMeal = asyncHandler(async (req, res) => {
  const { name, nutritionalInfo, cost, consumedAt, mealType, location } = req.body;

  if (!name || !nutritionalInfo || !nutritionalInfo.calories) {
    throw new ErrorResponse('Please provide meal name and nutritional information', 400);
  }

  const externalMeal = await ExternalMeal.create({
    user: req.user.id,
    name,
    nutritionalInfo,
    cost: cost || 0,
    consumedAt: consumedAt || Date.now(),
    mealType: mealType || 'Other',
    location: location || ''
  });

  // Update user's daily intake
  const user = await User.findById(req.user.id);
  user.resetDailyIntake();
  user.dailyCalorieIntake += nutritionalInfo.calories;
  user.dailyProteinIntake += nutritionalInfo.proteins || 0;

  // Update monthly spending if cost is provided
  if (cost > 0) {
    user.currentMonthSpent += cost;
  }

  await user.save();

  res.status(201).json({
    success: true,
    message: 'External meal added successfully',
    data: externalMeal
  });
});

// @desc    Get external meals history
// @route   GET /api/users/external-meals
// @access  Private
export const getExternalMeals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const meals = await ExternalMeal.find({ user: req.user.id })
    .sort({ consumedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ExternalMeal.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    data: meals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
