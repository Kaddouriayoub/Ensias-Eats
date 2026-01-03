import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
  getDashboardStats,
  getAllOrders
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(process.cwd(), 'temp_uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
router.post('/meals', upload.single('image'), createMeal);
router.put('/meals/:id', upload.single('image'), updateMeal);
router.delete('/meals/:id', deleteMeal);
router.get('/meals/profit-stats', getMealProfitStats);
router.get('/orders', getAllOrders);

// ============================================
// ANALYTICS & REPORTS ROUTES
// ============================================
router.get('/analytics/revenue', getRevenueStats);
router.get('/reports', getAllReports);
router.put('/reports/:id/resolve', resolveReport);

export default router;
