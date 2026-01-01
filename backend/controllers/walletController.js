import { Wallet, Transaction, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    throw new ErrorResponse('Wallet not found', 404);
  }

  res.json({
    success: true,
    data: wallet
  });
});

// @desc    Add funds to wallet (Recharge)
// @route   POST /api/wallet/recharge
// @access  Private
export const rechargeWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new ErrorResponse('Please provide a valid amount', 400);
  }

  // Find or create wallet
  let wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    // Create wallet if it doesn't exist
    wallet = await Wallet.create({
      user: req.user.id,
      balance: 0,
      monthlyBudgetCap: 0
    });
  }

  // Add funds
  await wallet.addFunds(amount);

  // Create transaction record
  await Transaction.create({
    wallet: wallet._id,
    user: req.user.id,
    type: 'credit',
    amount,
    description: 'Wallet recharge',
    paymentMethod: 'wallet_recharge',
    balanceAfter: wallet.balance,
    status: 'completed'
  });

  res.json({
    success: true,
    message: `Wallet recharged successfully with ${amount} DHS`,
    data: wallet
  });
});

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { type, startDate, endDate } = req.query;

  // Build query
  let query = { user: req.user.id };

  if (type) {
    query.type = type;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('order', 'orderNumber status');

  const total = await Transaction.countDocuments(query);

  // Calculate summary
  const summary = await Transaction.aggregate([
    { $match: { user: req.user.id } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const summaryData = {
    totalCredits: summary.find(s => s._id === 'credit')?.total || 0,
    totalDebits: summary.find(s => s._id === 'debit')?.total || 0,
    creditCount: summary.find(s => s._id === 'credit')?.count || 0,
    debitCount: summary.find(s => s._id === 'debit')?.count || 0
  };

  res.json({
    success: true,
    count: transactions.length,
    data: transactions,
    summary: summaryData,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get wallet balance and budget info
// @route   GET /api/wallet/balance
// @access  Private
export const getBalance = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    throw new ErrorResponse('Wallet not found', 404);
  }

  const user = await User.findById(req.user.id);

  const remainingBudget = wallet.getRemainingBudget();
  const budgetUsagePercentage = wallet.monthlyBudgetCap > 0
    ? (wallet.currentMonthSpent / wallet.monthlyBudgetCap) * 100
    : 0;

  res.json({
    success: true,
    data: {
      balance: wallet.balance,
      monthlyBudgetCap: wallet.monthlyBudgetCap,
      currentMonthSpent: wallet.currentMonthSpent,
      remainingBudget,
      budgetUsagePercentage: budgetUsagePercentage.toFixed(2),
      lastTransactionDate: wallet.lastTransactionDate,
      isActive: wallet.isActive
    }
  });
});

// @desc    Update monthly budget cap
// @route   PATCH /api/wallet/budget
// @access  Private
export const updateBudgetCap = asyncHandler(async (req, res) => {
  const { monthlyBudgetCap } = req.body;

  if (monthlyBudgetCap === undefined || monthlyBudgetCap < 0) {
    throw new ErrorResponse('Please provide a valid budget cap', 400);
  }

  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    throw new ErrorResponse('Wallet not found', 404);
  }

  wallet.monthlyBudgetCap = monthlyBudgetCap;
  await wallet.save();

  // Also update user's budget cap
  const user = await User.findById(req.user.id);
  user.monthlyBudgetCap = monthlyBudgetCap;
  await user.save();

  res.json({
    success: true,
    message: 'Budget cap updated successfully',
    data: wallet
  });
});

// @desc    Reset monthly spending (Auto-called at start of month)
// @route   POST /api/wallet/reset-monthly
// @access  Private (Admin only - for manual reset if needed)
export const resetMonthlySpending = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    throw new ErrorResponse('Wallet not found', 404);
  }

  await wallet.resetMonthlySpending();

  // Also reset user's monthly spending
  const user = await User.findById(req.user.id);
  user.currentMonthSpent = 0;
  await user.save();

  res.json({
    success: true,
    message: 'Monthly spending reset successfully',
    data: wallet
  });
});

// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
export const getWalletStats = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });

  if (!wallet) {
    throw new ErrorResponse('Wallet not found', 404);
  }

  // Get this month's transactions
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTransactions = await Transaction.find({
    user: req.user.id,
    createdAt: { $gte: startOfMonth }
  });

  const monthlyCredits = monthlyTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyDebits = monthlyTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Average transaction amount
  const avgCredit = monthlyTransactions.filter(t => t.type === 'credit').length > 0
    ? monthlyCredits / monthlyTransactions.filter(t => t.type === 'credit').length
    : 0;

  const avgDebit = monthlyTransactions.filter(t => t.type === 'debit').length > 0
    ? monthlyDebits / monthlyTransactions.filter(t => t.type === 'debit').length
    : 0;

  res.json({
    success: true,
    data: {
      currentBalance: wallet.balance,
      monthlyBudget: wallet.monthlyBudgetCap,
      monthlySpent: wallet.currentMonthSpent,
      remainingBudget: wallet.getRemainingBudget(),
      thisMonth: {
        totalCredits: monthlyCredits,
        totalDebits: monthlyDebits,
        transactionCount: monthlyTransactions.length,
        averageCredit: avgCredit.toFixed(2),
        averageDebit: avgDebit.toFixed(2)
      }
    }
  });
});
