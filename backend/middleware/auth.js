import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('❌ User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user completed onboarding
export const checkOnboarding = (req, res, next) => {
  if (!req.user.onboardingCompleted && req.user.role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Please complete onboarding first',
      requiresOnboarding: true
    });
  }
  next();
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Staff only middleware (includes both cafeteria_staff and admin)
export const staffOnly = (req, res, next) => {
  if (req.user.role !== 'cafeteria_staff' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff privileges required.'
    });
  }
  next();
};

// Check if account is suspended
export const checkSuspension = (req, res, next) => {
  if (req.user.isSuspended) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been suspended. Please contact administration.',
      suspensionReason: req.user.suspensionReason,
      suspendedAt: req.user.suspendedAt
    });
  }
  next();
};
