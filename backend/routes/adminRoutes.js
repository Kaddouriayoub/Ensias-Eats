import express from 'express';
import {
  // User Management
  getAllUsers,
  getUserDetails,
  suspendUser,
  activateUser,
  deleteUser,

  // Staff Management
  createStaffAccount,
  getAllStaff,
  updateStaff,
  deleteStaff,

  // Meal Management
  createMeal,
  updateMeal,
  deleteMeal,
  getMealProfitStats,

  // Analytics & Reports
  getRevenueStats,
  getAllReports,
  resolveReport,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(adminOnly);

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard/stats', getDashboardStats);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);

// ============================================
// STAFF MANAGEMENT ROUTES
// ============================================
router.post('/staff', createStaffAccount);
router.get('/staff', getAllStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// ============================================
// MEAL MANAGEMENT ROUTES
// ============================================
router.post('/meals', createMeal);
router.put('/meals/:id', updateMeal);
router.delete('/meals/:id', deleteMeal);
router.get('/meals/profit-stats', getMealProfitStats);

// ============================================
// ANALYTICS & REPORTS ROUTES
// ============================================
router.get('/analytics/revenue', getRevenueStats);
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

export default router;
