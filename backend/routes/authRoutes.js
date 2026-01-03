import express from 'express';
import { body } from 'express-validator';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

console.log('✅ Auth Routes Loaded');

// ============================================
// LOCAL AUTH (FOR ADMIN/DEV)
// ============================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Restrict registration to admin and staff only
    if (!['admin', 'cafeteria_staff'].includes(role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'This route is restricted to admin and cafeteria staff registration only. Students must use Microsoft Login.' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      onboardingCompleted: true
    });

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
      return res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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