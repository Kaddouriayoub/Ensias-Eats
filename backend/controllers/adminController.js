import { User, Meal, Order, UserReport, Wallet, Transaction } from '../models/index.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to save image to public folder
const saveImageToPublic = (file) => {
  if (!file) return null;
  try {
    // Use path.resolve to get the absolute path to the public directory
    const publicDir = path.resolve(__dirname, '..', 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    
    // Ensure directories exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    let ext = path.extname(file.originalname);
    if (!ext || ext === '.') ext = '.jpg';

    const filename = `meal-${Date.now()}${ext}`;
    const targetPath = path.join(uploadsDir, filename);
    
    console.log(`📂 Saving image to: ${targetPath}`);

    // Handle both DiskStorage (file.path) and MemoryStorage (file.buffer)
    if (file.path) {
      fs.copyFileSync(file.path, targetPath);
      try { fs.unlinkSync(file.path); } catch (e) { console.warn('Note: Failed to delete temp file:', e.message); }
    } else if (file.buffer) {
      fs.writeFileSync(targetPath, file.buffer);
    } else {
      console.error('❌ No file path or buffer found in req.file');
      return null;
    }
    
    const relativePath = `uploads/${filename}`.replace(/\\/g, '/'); // Ensure forward slashes
    console.log(`✅ Image saved successfully as: ${relativePath}`);
    return relativePath;
  } catch (error) {
    console.error('❌ Error saving image to public:', error);
    return null;
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (req, res) => {
  try {
    const { role, search, suspended, page = 1, limit = 20 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (suspended !== undefined) query.isSuspended = suspended === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'wallets',
          localField: '_id',
          foreignField: 'user',
          as: 'walletData'
        }
      },
      {
        $addFields: {
          wallet: { $arrayElemAt: ['$walletData', 0] }
        }
      },
      {
        $project: {
          password: 0,
          walletData: 0,
          __v: 0
        }
      }
    ]);

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

    console.log(`⚠️ User ${user.email} suspended by ${req.user.email}`);

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

    console.log(`✅ User ${user.email} activated by ${req.user.email}`);

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

    if (user.wallet) {
      await Wallet.findByIdAndDelete(user.wallet);
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`🗑️ User ${user.email} deleted by ${req.user.email}`);

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
// WALLET MANAGEMENT
// ============================================

export const chargeUserWallet = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create wallet for the user
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await Wallet.create({
        user: userId,
        balance: 0,
        monthlyBudgetCap: user.monthlyBudgetCap || 0
      });
      
      // Link wallet to user
      user.wallet = wallet._id;
      await user.save();
    } else if (!user.wallet) {
      // Ensure link exists if wallet was found but not linked
      user.wallet = wallet._id;
      await user.save();
    }

    // Add funds using the wallet's addFunds method
    await wallet.addFunds(amount);

    // Create transaction record
    await Transaction.create({
      wallet: wallet._id,
      user: userId,
      type: 'credit',
      amount,
      description: description || `Admin wallet recharge by ${req.user.name}`,
      paymentMethod: 'wallet_recharge',
      balanceAfter: wallet.balance,
      status: 'completed'
    });

    console.log(`💰 Admin ${req.user.email} charged ${amount} DH to ${user.email}'s wallet`);

    res.json({
      success: true,
      message: `Successfully charged ${amount} DH to ${user.name}'s wallet`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        wallet: {
          balance: wallet.balance,
          previousBalance: wallet.balance - amount
        },
        transaction: {
          amount,
          description: description || `Admin wallet recharge by ${req.user.name}`
        }
      }
    });
  } catch (error) {
    console.error('Error charging user wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error charging wallet'
    });
  }
};

export const getUserWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          },
          wallet: null,
          message: 'User has no wallet yet'
        }
      });
    }

    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        wallet: {
          balance: wallet.balance,
          monthlyBudgetCap: wallet.monthlyBudgetCap,
          currentMonthSpent: wallet.currentMonthSpent,
          isActive: wallet.isActive
        },
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error getting user wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet information'
    });
  }
};

// ============================================
// STAFF MANAGEMENT
// ============================================

export const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: 'cafeteria_staff',
      onboardingCompleted: true
    });

    console.log(`👤 Staff account created: ${email} by ${req.user.email}`);

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

    console.log(`🗑️ Staff ${staff.email} deleted by ${req.user.email}`);

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

export const createMeal = async (req, res) => {
  try {
    let { name, description, price, cost, category, nutritionalInfo, dietary, availableDays, isAvailable } = req.body;

    console.log('📝 Create Meal Request Body:', req.body);
    console.log('📁 Uploaded File:', req.file ? req.file.originalname : 'None');
    
    // Handle file upload FIRST
    let image = null;
    if (req.file) {
      console.log('✅ Processing uploaded file:', req.file.originalname);
      const savedPath = saveImageToPublic(req.file);
      if (savedPath && savedPath.length > 0) {
        image = savedPath;
        console.log('✅ Image saved at:', savedPath);
      } else {
        console.error('❌ Failed to save image');
      }
    } else {
      console.log('⚠️ No file uploaded');
    }

    // Parse JSON strings if coming from FormData
    if (typeof nutritionalInfo === 'string') {
      try {
        nutritionalInfo = JSON.parse(nutritionalInfo);
      } catch (e) {
        console.error('Error parsing nutritionalInfo:', e);
      }
    }
    if (typeof dietary === 'string') {
      try {
        dietary = JSON.parse(dietary);
      } catch (e) {
        console.error('Error parsing dietary:', e);
      }
    }
    if (typeof availableDays === 'string') {
      try {
        availableDays = JSON.parse(availableDays);
      } catch (e) {
        console.error('Error parsing availableDays:', e);
      }
    }

    // Ensure numbers
    price = parseFloat(price) || 0;
    cost = parseFloat(cost) || 0;

    // Calculate profit margin
    const profitMargin = price - cost;

    // Create meal with the saved image path
    const meal = await Meal.create({
      name,
      description,
      price,
      cost,
      image,
      profitMargin,
      category,
      nutritionalInfo: {
        calories: parseFloat(nutritionalInfo?.calories) || 0,
        proteins: parseFloat(nutritionalInfo?.proteins) || 0,
        carbohydrates: parseFloat(nutritionalInfo?.carbohydrates) || 0,
        fats: parseFloat(nutritionalInfo?.fats) || 0,
        fiber: parseFloat(nutritionalInfo?.fiber) || 0
      },
      dietary,
      availableDays,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      createdBy: req.user._id
    });

    console.log('✅ Meal created successfully:', meal.name);
    console.log('📷 Image saved as:', meal.image);

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    console.error('❌ Error creating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meal',
      error: error.message
    });
  }
};

export const updateMeal = async (req, res) => {
  try {
    console.log('📝 Update Meal - ID:', req.params.id);
    console.log('📁 Uploaded File:', req.file ? req.file.originalname : 'None');
    console.log('📝 Request Body:', req.body);
    
    let { name, description, price, cost, category, nutritionalInfo, dietary, availableDays, isAvailable } = req.body;
    
    // Parse JSON strings
    if (typeof nutritionalInfo === 'string') {
      try {
        nutritionalInfo = JSON.parse(nutritionalInfo);
      } catch (e) {
        console.error('Error parsing nutritionalInfo:', e);
      }
    }
    if (typeof dietary === 'string') {
      try {
        dietary = JSON.parse(dietary);
      } catch (e) {
        console.error('Error parsing dietary:', e);
      }
    }
    if (typeof availableDays === 'string') {
      try {
        availableDays = JSON.parse(availableDays);
      } catch (e) {
        console.error('Error parsing availableDays:', e);
      }
    }

    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Update basic fields
    if (name !== undefined) meal.name = name;
    if (description !== undefined) meal.description = description;
    if (price !== undefined) meal.price = parseFloat(price) || 0;
    if (cost !== undefined) meal.cost = parseFloat(cost) || 0;
    if (category !== undefined) meal.category = category;
    if (isAvailable !== undefined) {
      meal.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Update complex fields
    if (nutritionalInfo) {
      meal.nutritionalInfo = {
        calories: parseFloat(nutritionalInfo.calories) || 0,
        proteins: parseFloat(nutritionalInfo.proteins) || 0,
        carbohydrates: parseFloat(nutritionalInfo.carbohydrates) || 0,
        fats: parseFloat(nutritionalInfo.fats) || 0,
        fiber: parseFloat(nutritionalInfo.fiber) || 0
      };
    }
    if (dietary) meal.dietary = dietary;
    if (availableDays) meal.availableDays = availableDays;

    // Handle image update
    if (req.file) {
      console.log('✅ Processing new uploaded file:', req.file.originalname);
      const savedPath = saveImageToPublic(req.file);
      if (savedPath && savedPath.length > 0) {
        meal.image = savedPath;
        console.log('✅ Image updated to:', savedPath);
      }
    } else if (req.body.image === '' || req.body.image === null || req.body.image === 'null') {
      meal.image = null;
      console.log('🗑️ Image cleared');
    }

    // Recalculate profit margin
    meal.profitMargin = (meal.price || 0) - (meal.cost || 0);

    meal.updatedBy = req.user._id;
    await meal.save();

    console.log('✅ Meal updated successfully:', meal.name);

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal
    });
  } catch (error) {
    console.error('❌ Error updating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meal',
      error: error.message
    });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    console.log(`🗑️ Meal deleted: ${meal.name} by ${req.user.email}`);

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

export const getMealProfitStats = async (req, res) => {
  try {
    const meals = await Meal.find()
      .select('name price cost profitMargin orderCount')
      .lean();

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

export const getRevenueStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;

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

    console.log(`✅ Report resolved by ${req.user.email}`);

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

export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : new Date(startDate);
      end.setHours(23, 59, 59, 999);
      dateQuery = { createdAt: { $gte: start, $lte: end } };
    }

    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: 'cafeteria_staff' });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    const totalOrders = await Order.countDocuments({ status: { $in: ['completed', 'paid'] }, ...dateQuery });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const calculateRevenue = async (dateFilter = {}) => {
      const result = await Order.aggregate([
        { 
          $match: { 
            status: { $in: ['completed', 'paid'] },
            ...dateFilter
          } 
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]);
      return result[0]?.totalRevenue || 0;
    };

    const calculateProfit = async (dateFilter = {}) => {
      const result = await Order.aggregate([
        { 
          $match: { 
            status: { $in: ['completed', 'paid'] },
            ...dateFilter
          } 
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'meals',
            localField: 'items.meal',
            foreignField: '_id',
            as: 'mealData'
          }
        },
        { $unwind: { path: '$mealData', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalProfit: {
              $sum: {
                $multiply: [
                  '$items.quantity',
                  { $subtract: ['$items.price', { $ifNull: ['$mealData.cost', 0] }] }
                ]
              }
            }
          }
        }
      ]);
      return result[0]?.totalProfit || 0;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalRevenue = await calculateRevenue(dateQuery);
    const todayRevenue = await calculateRevenue({ createdAt: { $gte: today } });
    const monthRevenue = await calculateRevenue({ createdAt: { $gte: startOfMonth } });

    const totalProfit = await calculateProfit(dateQuery);
    const todayProfit = await calculateProfit({ createdAt: { $gte: today } });
    const monthProfit = await calculateProfit({ createdAt: { $gte: startOfMonth } });

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
          total: totalRevenue,
          todayRevenue,
          monthRevenue,
          profit: totalProfit,
          todayProfit,
          monthProfit
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

export const getAllOrders = async (req, res) => {
  try {
    const { status, date, studentId, page = 1, limit = 50 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (studentId) {
      query.student = studentId;
    }

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