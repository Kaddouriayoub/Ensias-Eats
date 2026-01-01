import express from 'express';
import { body } from 'express-validator';
import {
  getTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  toggleTimeSlotAvailability
} from '../controllers/timeSlotController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getTimeSlots);
router.get('/:id', getTimeSlotById);

// Cafeteria staff / admin routes
router.post('/', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('maxOrders').optional().isInt({ min: 1 }).withMessage('Max orders must be at least 1'),
  validate
], createTimeSlot);

router.put('/:id', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  validate
], updateTimeSlot);

router.patch('/:id/availability', protect, authorize('cafeteria_staff', 'admin'), toggleTimeSlotAvailability);

// Admin only
router.delete('/:id', protect, authorize('admin'), deleteTimeSlot);

export default router;
