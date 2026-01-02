import { User, Meal, Order, UserReport, Wallet } from '../models/index.js';
import bcrypt from 'bcryptjs';

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, suspended, page = 1, limit = 20 } = req.query;

    let query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by suspension status
    if (suspended !== undefined) {
      query.isSuspended = suspended === 'true';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('wallet')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      { $match: { student: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0, completedOrders: 0 }
      }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.params.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedBy = req.user._id;
    user.suspensionReason = reason;

    await user.save();

    console.log(` User ${user.email} suspended by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Error suspending user'
    });
  }
};

// Activate user (remove suspension)
export const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = false;
    user.suspendedAt = null;
    user.suspendedBy = null;
    user.suspensionReason = null;

    await user.save();

    console.log(` User ${user.email} activated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating user'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete associated wallet if exists
    if (user.wallet) {
      await Wallet.findByIdAndDelete(user.wallet);
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`=Ñ  User ${user.email} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// ============================================
// STAFF MANAGEMENT
// ============================================

// Create cafeteria staff account
export const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create staff user
    const staff = await User.create({
      name,
      email,
      password,
      role: 'cafeteria_staff',
      onboardingCompleted: true
    });

    console.log(` Staff account created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Error creating staff account:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating staff account'
    });
  }
};

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'cafeteria_staff' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: staff,
      count: staff.length
    });
  } catch (error) {
    console.error('Error getting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff'
    });
  }
};

// Update staff
export const updateStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'cafeteria_staff') {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    if (name) staff.name = name;
    if (email) staff.email = email;
    if (password) staff.password = password;

    await staff.save();

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff'
    });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== 'cafeteria_staff') {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`=Ñ  Staff ${staff.email} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Staff deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff'
    });
  }
};

// ============================================
// MEAL MANAGEMENT WITH PROFIT TRACKING
// ============================================

// Create meal
export const createMeal = async (req, res) => {
  try {
    const { name, description, price, cost, category, nutritionalInfo, dietary, availableDays } = req.body;

    // Calculate profit margin
    const profitMargin = (price || 0) - (cost || 0);

    const meal = await Meal.create({
      name,
      description,
      price,
      cost: cost || 0,
      profitMargin,
      category,
      nutritionalInfo,
      dietary,
      availableDays,
      createdBy: req.user._id
    });

    console.log(` Meal created: ${name} (Cost: ${cost} DH, Price: ${price} DH, Profit: ${profitMargin} DH)`);

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meal',
      error: error.message
    });
  }
};

// Update meal
export const updateMeal = async (req, res) => {
  try {
    const { price, cost } = req.body;
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'profitMargin') {
        meal[key] = req.body[key];
      }
    });

    // Recalculate profit margin if price or cost changed
    if (price !== undefined || cost !== undefined) {
      const finalPrice = price !== undefined ? price : meal.price;
      const finalCost = cost !== undefined ? cost : meal.cost;
      meal.profitMargin = finalPrice - finalCost;
    }

    meal.updatedBy = req.user._id;
    await meal.save();

    console.log(` Meal updated: ${meal.name}`);

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meal'
    });
  }
};

// Delete meal
export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    console.log(`=Ñ  Meal deleted: ${meal.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meal'
    });
  }
};

// Get meal profit statistics
export const getMealProfitStats = async (req, res) => {
  try {
    // Get all meals with profit data
    const meals = await Meal.find()
      .select('name price cost profitMargin orderCount')
      .lean();

    // Calculate total profit from all orders
    const profitByMeal = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'paid'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'meals',
          localField: 'items.meal',
          foreignField: '_id',
          as: 'mealData'
        }
      },
      { $unwind: '$mealData' },
      {
        $group: {
          _id: '$items.meal',
          mealName: { $first: '$mealData.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          profitPerUnit: { $first: '$mealData.profitMargin' }
        }
      },
      {
        $project: {
          mealName: 1,
          totalSold: 1,
          totalRevenue: 1,
          profitPerUnit: 1,
          totalProfit: { $multiply: ['$totalSold', '$profitPerUnit'] }
        }
      },
      { $sort: { totalProfit: -1 } }
    ]);

    // Calculate overall statistics
    const totalProfit = profitByMeal.reduce((sum, meal) => sum + meal.totalProfit, 0);
    const totalRevenue = profitByMeal.reduce((sum, meal) => sum + meal.totalRevenue, 0);

    res.json({
      success: true,
      data: {
        meals: profitByMeal,
        totalProfit,
        totalRevenue,
        profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error getting profit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profit statistics'
    });
  }
};

// ============================================
// ANALYTICS & REPORTS
// ============================================

// Get revenue statistics
export const getRevenueStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month, year

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'day':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setHours(0, 0, 0, 0))
          }
        };
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        dateFilter = { createdAt: { $gte: yearAgo } };
        break;
    }

    const stats = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['completed', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      period,
      data: stats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics'
    });
  }
};

// Get all reports (from staff)
export const getAllReports = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await UserReport.find(query)
      .populate('reportedUser', 'name email')
      .populate('reportedBy', 'name email')
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

// Resolve report
export const resolveReport = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const report = await UserReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'resolved';
    report.adminNotes = adminNotes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();

    await report.save();

    console.log(` Report resolved by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Report resolved successfully',
      data: report
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving report'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'cafeteria_staff' });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    // Order statistics
    const totalOrders = await Order.countDocuments({ status: { $in: ['completed', 'paid'] } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Revenue
    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'paid'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Meal statistics
    const totalMeals = await Meal.countDocuments();
    const activeMeals = await Meal.countDocuments({ isAvailable: true });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          suspended: suspendedUsers
        },
        staff: {
          total: totalStaff
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders
        },
        revenue: {
          total: revenueStats[0]?.totalRevenue || 0
        },
        meals: {
          total: totalMeals,
          active: activeMeals
        }
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
