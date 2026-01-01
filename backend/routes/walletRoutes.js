import express from 'express';
import { body } from 'express-validator';
import {
  getWallet,
  rechargeWallet,
  getTransactions,
  getBalance,
  updateBudgetCap,
  resetMonthlySpending,
  getWalletStats
} from '../controllers/walletController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Wallet management
router.get('/', getWallet);
router.get('/balance', getBalance);
router.get('/stats', getWalletStats);

// Recharge wallet
router.post('/recharge', [
  body('amount').isNumeric({ gt: 0 }).withMessage('Amount must be greater than 0'),
  validate
], rechargeWallet);

// Transactions
router.get('/transactions', getTransactions);

// Budget management
router.patch('/budget', [
  body('monthlyBudgetCap').isNumeric({ min: 0 }).withMessage('Monthly budget cap must be a non-negative number'),
  validate
], updateBudgetCap);

// Admin only - manual monthly reset
router.post('/reset-monthly', authorize('admin'), resetMonthlySpending);

export default router;
