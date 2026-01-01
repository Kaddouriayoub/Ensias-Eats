import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  getDashboard,
  getOrderHistory,
  addExternalMeal,
  getExternalMeals
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('nutritionalGoal').optional().isIn(['High Energy', 'Balanced', 'Light Focused', 'None']).withMessage('Invalid nutritional goal'),
  body('monthlyBudgetCap').optional().isNumeric().withMessage('Monthly budget cap must be a number'),
  body('preferredPaymentMethod').optional().isIn(['wallet', 'cash_on_delivery']).withMessage('Invalid payment method'),
  validate
], updateProfile);

// Dashboard
router.get('/dashboard', getDashboard);

// Order history
router.get('/orders', getOrderHistory);

// External meals
router.post('/external-meals', [
  body('name').trim().notEmpty().withMessage('Meal name is required'),
  body('nutritionalInfo.calories').isNumeric().withMessage('Calories must be a number'),
  body('nutritionalInfo.proteins').optional().isNumeric().withMessage('Proteins must be a number'),
  body('nutritionalInfo.carbohydrates').optional().isNumeric().withMessage('Carbohydrates must be a number'),
  body('cost').optional().isNumeric().withMessage('Cost must be a number'),
  body('mealType').optional().isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other']).withMessage('Invalid meal type'),
  validate
], addExternalMeal);

router.get('/external-meals', getExternalMeals);

export default router;
