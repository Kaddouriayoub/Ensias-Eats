import express from 'express';
import { body } from 'express-validator';
import {
  getMicrosoftLoginUrl,
  microsoftCallback,
  getMe,
  logout,
  completeOnboarding
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Microsoft OAuth routes
router.get('/microsoft/login', getMicrosoftLoginUrl);
router.get('/microsoft/callback', microsoftCallback);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Onboarding
router.post('/onboarding', [
  protect,
  body('monthlyBudgetCap').isNumeric().withMessage('Monthly budget cap must be a number'),
  body('nutritionalGoal').isIn(['High Energy', 'Balanced', 'Light Focused', 'None']).withMessage('Invalid nutritional goal'),
  body('preferredPaymentMethod').optional().isIn(['wallet', 'cash_on_delivery']).withMessage('Invalid payment method'),
  validate
], completeOnboarding);

export default router;
