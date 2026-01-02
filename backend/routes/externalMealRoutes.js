import express from 'express';
import {
  createExternalMeal,
  getMyExternalMeals,
  getExternalMeal,
  updateExternalMeal,
  deleteExternalMeal
} from '../controllers/externalMealController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new external meal
router.post('/', createExternalMeal);

// Get all my external meals
router.get('/my-meals', getMyExternalMeals);

// Get, update, delete a specific external meal
router.route('/:id')
  .get(getExternalMeal)
  .put(updateExternalMeal)
  .delete(deleteExternalMeal);

export default router;
