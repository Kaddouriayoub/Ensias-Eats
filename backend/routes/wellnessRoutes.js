import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyWellnessData,
  getWellnessData,
  getMonthlyWellnessData,
  updateDailyGoals
} from '../controllers/wellnessController.js';

const router = express.Router();

// Get authenticated user's wellness data (must come before /:userId)
router.get('/me', protect, getMyWellnessData);

// Get today's wellness data or data for a specific date
router.get('/:userId', protect, getWellnessData);

// Get monthly wellness data
router.get('/:userId/monthly', protect, getMonthlyWellnessData);

// Update daily nutrition goals
router.put('/:userId/goals', protect, updateDailyGoals);

export default router;
