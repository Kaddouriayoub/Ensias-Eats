import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  collectOrder
} from '../controllers/orderController.js';
import { protect, authorize, checkOnboarding } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Student routes
router.post('/', [
  protect,
  checkOnboarding,
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.mealId').notEmpty().withMessage('Meal ID is required for each item'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('pickupTimeSlot').notEmpty().withMessage('Pickup time slot is required'),
  body('paymentMethod').isIn(['wallet', 'cash_on_delivery']).withMessage('Invalid payment method'),
  validate
], createOrder);

router.get('/my-orders', protect, getMyOrders);

router.get('/:id', protect, getOrderById);

router.patch('/:id/cancel', [
  protect,
  body('reason').optional().trim(),
  validate
], cancelOrder);

// Cafeteria staff / admin routes
router.get('/', protect, authorize('cafeteria_staff', 'admin'), getAllOrders);

router.patch('/:id/status', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']).withMessage('Invalid status'),
  validate
], updateOrderStatus);

router.patch('/:id/collect', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  body('qrData').optional().trim(),
  validate
], collectOrder);

export default router;
