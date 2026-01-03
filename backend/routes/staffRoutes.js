import express from 'express';
import {
  // Order Management
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  markOrderCollected,
  cancelOrder,
  getTodayStats,

  // Wallet Charging
  chargeWallet,
  searchStudents,
  getWalletTransactions,

  // User Reporting
  createReport,
  getMyReports,

  // Dashboard
  getStaffDashboard
} from '../controllers/staffController.js';
import { protect, staffOnly } from '../middleware/auth.js';

const router = express.Router();

// All staff routes require authentication and staff privileges
router.use(protect);
router.use(staffOnly);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', getStaffDashboard);
router.get('/stats/today', getTodayStats);

// ============================================
// ORDER MANAGEMENT ROUTES
// ============================================
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment-status', updatePaymentStatus);
router.put('/orders/:id/collect', markOrderCollected);
router.put('/orders/:id/cancel', cancelOrder);

// ============================================
// WALLET CHARGING ROUTES
// ============================================
router.post('/wallet/charge', chargeWallet);
router.get('/wallet/transactions', getWalletTransactions);
router.get('/students/search', searchStudents);

// ============================================
// USER REPORTING ROUTES
// ============================================
router.post('/reports', createReport);
router.get('/reports', getMyReports);

export default router;
