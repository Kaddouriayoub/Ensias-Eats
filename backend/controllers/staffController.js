import { Order, User, Wallet, WalletTransaction, UserReport } from '../models/index.js';

// ============================================
// ORDER MANAGEMENT
// ============================================

// Get all orders with filters
export const getAllOrders = async (req, res) => {
  try {
    const { status, date, studentId, page = 1, limit = 50 } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by student
    if (studentId) {
      query.student = studentId;
    }

    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.pickupTimeSlot = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const orders = await Order.find(query)
      .populate('student', 'name email studentId')
      .populate('items.meal', 'name category')
      .populate('collectedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name email studentId phone')
      .populate('items.meal', 'name category price nutritionalInfo')
      .populate('collectedBy', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.status = status;

    // If marking as ready, send notification
    if (status === 'ready') {
      order.notificationSent.ready = true;
      // TODO: Send push notification to student
    }

    await order.save();

    console.log(`✅ Order ${order.orderNumber} status updated to ${status} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// Mark order as collected
export const markOrderCollected = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'Order must be in ready status to be collected'
      });
    }

    // Mark as collected
    await order.markAsCollected(req.user._id);

    console.log(`✅ Order ${order.orderNumber} collected by staff ${req.user.email}`);

    res.json({
      success: true,
      message: 'Order marked as collected',
      data: order
    });
  } catch (error) {
    console.error('Error marking order as collected:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking order as collected'
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    try {
      await order.cancelOrder(reason);

      console.log(`❌ Order ${order.orderNumber} cancelled by staff ${req.user.email}`);

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
};

// Get order statistics for today
export const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalOrders = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error getting today stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// ============================================
// WALLET CHARGING
// ============================================

// Charge student wallet
export const chargeWallet = async (req, res) => {
  try {
    const { studentId, amount, paymentMethod = 'cash', notes } = req.body;

    // Validation
    if (!studentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be positive'
      });
    }

    // Get student
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is suspended
    if (student.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Cannot charge wallet for suspended student',
        suspensionReason: student.suspensionReason
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: studentId });
    if (!wallet) {
      wallet = await Wallet.create({ user: studentId, balance: 0 });
    }

    // Add funds to wallet
    const previousBalance = wallet.balance;
    await wallet.addFunds(amount);

    // Create transaction record
    const transaction = await WalletTransaction.create({
      user: studentId,
      wallet: wallet._id,
      type: 'charge',
      amount: amount,
      balanceAfter: wallet.balance,
      processedBy: req.user._id,
      paymentMethod: paymentMethod,
      notes: notes || `Wallet charged by ${req.user.name}`,
      status: 'completed'
    });

    console.log(`💰 Wallet charged: ${student.email} + ${amount} DH (by ${req.user.email})`);

    res.json({
      success: true,
      message: 'Wallet charged successfully',
      data: {
        previousBalance,
        newBalance: wallet.balance,
        amountAdded: amount,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Error charging wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error charging wallet',
      error: error.message
    });
  }
};

// Search students for wallet charging
export const searchStudents = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const students = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ]
    })
      .select('name email studentId isSuspended')
      .populate('wallet', 'balance')
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching students'
    });
  }
};

// Get wallet transaction history
export const getWalletTransactions = async (req, res) => {
  try {
    const { studentId, page = 1, limit = 20 } = req.query;

    let query = {};
    if (studentId) {
      query.user = studentId;
    }

    // Staff can see transactions they processed or all if admin
    if (req.user.role === 'cafeteria_staff') {
      query.processedBy = req.user._id;
    }

    const transactions = await WalletTransaction.find(query)
      .populate('user', 'name email studentId')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await WalletTransaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};

// ============================================
// USER REPORTING
// ============================================

// Create report about a student
export const createReport = async (req, res) => {
  try {
    const { studentId, reportType, description, priority = 'medium', relatedOrderId } = req.body;

    // Validation
    if (!studentId || !reportType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, report type, and description are required'
      });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create report
    const report = await UserReport.create({
      reportedUser: studentId,
      reportedBy: req.user._id,
      reportType,
      description,
      priority,
      relatedOrder: relatedOrderId || null,
      status: 'pending'
    });

    await report.populate('reportedUser', 'name email studentId');

    console.log(`⚠️  Report created: ${student.email} by ${req.user.email} (${reportType})`);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// Get reports created by this staff member
export const getMyReports = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { reportedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const reports = await UserReport.find(query)
      .populate('reportedUser', 'name email studentId')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// ============================================
// DASHBOARD
// ============================================

// Get staff dashboard statistics
export const getStaffDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Orders today
    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    // Orders by status today
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending orders (urgent)
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    // Ready orders (waiting for pickup)
    const readyOrders = await Order.countDocuments({
      status: 'ready'
    });

    // My reports
    const myReports = await UserReport.countDocuments({
      reportedBy: req.user._id,
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        ordersToday,
        ordersByStatus,
        pendingOrders,
        readyOrders,
        pendingReports: myReports
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};
