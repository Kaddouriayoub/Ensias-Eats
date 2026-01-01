import { Meal, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get all available meals
// @route   GET /api/meals
// @access  Public
export const getMeals = asyncHandler(async (req, res) => {
  const { category, isAvailable, search } = req.query;

  // Build query
  let query = {};

  if (category) {
    query.category = category;
  }

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  if (search) {
    query.$text = { $search: search };
  }

  const meals = await Meal.find(query).sort({ orderCount: -1, name: 1 });

  // Filter by today's availability
  const availableToday = meals.filter(meal => meal.isAvailableToday());

  res.json({
    success: true,
    count: availableToday.length,
    data: availableToday
  });
});

// @desc    Get single meal by ID
// @route   GET /api/meals/:id
// @access  Public
export const getMealById = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    throw new ErrorResponse('Meal not found', 404);
  }

  res.json({
    success: true,
    data: meal
  });
});

// @desc    Get meal recommendations for user
// @route   GET /api/meals/recommendations
// @access  Private
export const getMealRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wallet');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Get available meals
  const allMeals = await Meal.find({ isAvailable: true });
  const availableToday = allMeals.filter(meal => meal.isAvailableToday());

  // Simple recommendation based on nutritional goal
  let recommendations = [...availableToday];

  if (user.nutritionalGoal === 'High Energy') {
    recommendations.sort((a, b) => b.nutritionalInfo.calories - a.nutritionalInfo.calories);
  } else if (user.nutritionalGoal === 'Light Focused') {
    recommendations.sort((a, b) => a.nutritionalInfo.calories - b.nutritionalInfo.calories);
  } else if (user.nutritionalGoal === 'Balanced') {
    recommendations.sort((a, b) => {
      const aScore = Math.abs(a.nutritionalInfo.calories - 600) + Math.abs(a.nutritionalInfo.proteins - 30);
      const bScore = Math.abs(b.nutritionalInfo.calories - 600) + Math.abs(b.nutritionalInfo.proteins - 30);
      return aScore - bScore;
    });
  }

  // Also consider budget
  const wallet = user.wallet;
  const remainingBudget = wallet ? wallet.getRemainingBudget() : Infinity;

  recommendations = recommendations.map(meal => ({
    ...meal.toObject(),
    affordableWithBudget: meal.price <= remainingBudget,
    matchesGoal: true
  }));

  res.json({
    success: true,
    count: recommendations.length,
    data: recommendations.slice(0, 10) // Top 10 recommendations
  });
});

// @desc    Create new meal (Cafeteria staff/admin only)
// @route   POST /api/meals
// @access  Private (cafeteria_staff, admin)
export const createMeal = asyncHandler(async (req, res) => {
  const { name, description, price, nutritionalInfo, category, availableDays, dietary, tags, image } = req.body;

  const meal = await Meal.create({
    name,
    description,
    price,
    nutritionalInfo,
    category,
    availableDays,
    dietary,
    tags,
    image,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    message: 'Meal created successfully',
    data: meal
  });
});

// @desc    Update meal (Cafeteria staff/admin only)
// @route   PUT /api/meals/:id
// @access  Private (cafeteria_staff, admin)
export const updateMeal = asyncHandler(async (req, res) => {
  let meal = await Meal.findById(req.params.id);

  if (!meal) {
    throw new ErrorResponse('Meal not found', 404);
  }

  const { name, description, price, nutritionalInfo, category, isAvailable, availableDays, dietary, tags, image } = req.body;

  meal = await Meal.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      price,
      nutritionalInfo,
      category,
      isAvailable,
      availableDays,
      dietary,
      tags,
      image,
      updatedBy: req.user.id
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Meal updated successfully',
    data: meal
  });
});

// @desc    Delete meal (Admin only)
// @route   DELETE /api/meals/:id
// @access  Private (admin)
export const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    throw new ErrorResponse('Meal not found', 404);
  }

  await meal.deleteOne();

  res.json({
    success: true,
    message: 'Meal deleted successfully'
  });
});

// @desc    Toggle meal availability (Cafeteria staff/admin only)
// @route   PATCH /api/meals/:id/availability
// @access  Private (cafeteria_staff, admin)
export const toggleAvailability = asyncHandler(async (req, res) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    throw new ErrorResponse('Meal not found', 404);
  }

  meal.isAvailable = !meal.isAvailable;
  await meal.save();

  res.json({
    success: true,
    message: `Meal ${meal.isAvailable ? 'enabled' : 'disabled'}`,
    data: meal
  });
});

// @desc    Get meal categories
// @route   GET /api/meals/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Meal.distinct('category');

  res.json({
    success: true,
    data: categories
  });
});
