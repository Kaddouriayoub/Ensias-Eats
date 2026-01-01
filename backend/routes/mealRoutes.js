import express from 'express';
import { body } from 'express-validator';
import {
  getMeals,
  getMealById,
  getMealRecommendations,
  createMeal,
  updateMeal,
  deleteMeal,
  toggleAvailability,
  getCategories
} from '../controllers/mealController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getMeals);
router.get('/categories', getCategories);
router.get('/:id', getMealById);

// Protected routes (students)
router.get('/recommendations/for-me', protect, getMealRecommendations);

// Cafeteria staff / admin routes
router.post('/', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  body('name').trim().notEmpty().withMessage('Meal name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('nutritionalInfo.calories').isNumeric().withMessage('Calories must be a number'),
  body('nutritionalInfo.proteins').isNumeric().withMessage('Proteins must be a number'),
  body('nutritionalInfo.carbohydrates').isNumeric().withMessage('Carbohydrates must be a number'),
  body('category').isIn(['Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Snack', 'Salad', 'Other']).withMessage('Invalid category'),
  validate
], createMeal);

router.put('/:id', [
  protect,
  authorize('cafeteria_staff', 'admin'),
  body('name').optional().trim().notEmpty().withMessage('Meal name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  validate
], updateMeal);

router.patch('/:id/availability', protect, authorize('cafeteria_staff', 'admin'), toggleAvailability);

// Admin only
router.delete('/:id', protect, authorize('admin'), deleteMeal);

export default router;
