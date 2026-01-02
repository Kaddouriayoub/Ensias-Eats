import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Wallet } from '../models/index.js';
import {
  getMicrosoftLoginUrl,
  microsoftCallback,
  getMe,
  logout,
  completeOnboarding
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// MICROSOFT OAUTH ROUTES (FOR STUDENTS)
// ============================================

// Microsoft OAuth routes
router.get('/microsoft/login', getMicrosoftLoginUrl);
router.get('/microsoft/callback', microsoftCallback);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Onboarding
router.post('/onboarding', [
  protect,
  body('monthlyBudgetCap').isNumeric().withMessage('Monthly budget cap must be a number'),
  body('nutritionalGoal').isIn(['High Energy', 'Balanced', 'Light Focused', 'None']).withMessage('Invalid nutritional goal'),
  body('preferredPaymentMethod').optional().isIn(['wallet', 'cash_on_delivery']).withMessage('Invalid payment method'),
  validate
], completeOnboarding);

// ============================================
// LOCAL AUTH (FOR ADMIN & CAFETERIA STAFF)
// ============================================

// Helper: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @desc    Register admin or cafeteria staff
// @route   POST /api/auth/register
// @access  Public (restricted to admin/staff roles only)
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'cafeteria_staff']).withMessage('Role must be admin or cafeteria_staff')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user (password will be hashed by the pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password, // Don't hash here - the model does it automatically
      role,
      onboardingCompleted: true
    });

    // Create wallet for the user if role is not admin
    if (role !== 'admin') {
      await Wallet.create({
        user: user._id,
        balance: 0,
        monthlyBudgetCap: 0
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'Cafeteria staff'} account created successfully`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

// @desc    Login admin or cafeteria staff
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      });
    }

    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is admin or staff (students should use Microsoft login)
    if (user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students must use Microsoft login'
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
});

// @desc    Test route
// @route   GET /api/auth/test
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

export default router;