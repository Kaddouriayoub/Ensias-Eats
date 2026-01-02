import jwt from 'jsonwebtoken';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { User, Wallet } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

// Microsoft OAuth configuration - lazy initialization
let msalClient = null;

const getMsalClient = () => {
  if (!msalClient) {
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
      throw new ErrorResponse('Microsoft OAuth is not configured. Please set AZURE_CLIENT_ID and AZURE_CLIENT_SECRET in .env file', 500);
    }

    const msalConfig = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        // Use 'organizations' to allow any organizational account (multi-tenant)
        // This allows UM5 users from any UM5 tenant to sign in
        authority: 'https://login.microsoftonline.com/organizations',
        clientSecret: process.env.AZURE_CLIENT_SECRET
      }
    };

    msalClient = new ConfidentialClientApplication(msalConfig);
  }
  return msalClient;
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Get Microsoft OAuth login URL
// @route   GET /api/auth/microsoft/login
// @access  Public
export const getMicrosoftLoginUrl = asyncHandler(async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read', 'email', 'profile'],
    redirectUri: process.env.AZURE_REDIRECT_URI,
    // Force consent prompt for multi-tenant apps
    // This allows users to consent to the app on first login
    prompt: 'consent'
  };

  try {
    const client = getMsalClient();
    const authUrl = await client.getAuthCodeUrl(authCodeUrlParameters);
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    throw new ErrorResponse('Failed to generate Microsoft login URL', 500);
  }
});

// @desc    Microsoft OAuth callback
// @route   GET /api/auth/microsoft/callback
// @access  Public
export const microsoftCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new ErrorResponse('Authorization code not provided', 400);
  }

  const tokenRequest = {
    code,
    scopes: ['user.read', 'email', 'profile'],
    redirectUri: process.env.AZURE_REDIRECT_URI
  };

  try {
    // Get access token from Microsoft
    const client = getMsalClient();
    const response = await client.acquireTokenByCode(tokenRequest);

    // Get user info from Microsoft Graph API
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${response.accessToken}`
      }
    });

    const userInfo = await userInfoResponse.json();
    const email = userInfo.mail || userInfo.userPrincipalName;

    // Validate UM5 email domain
    if (!email.endsWith(process.env.ALLOWED_EMAIL_DOMAIN || '@um5.ac.ma')) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?message=invalid_domain`);
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: userInfo.displayName,
        email: email,
        um5AccountId: userInfo.id,
        password: Math.random().toString(36).slice(-8), // Random password (won't be used)
        role: 'student'
      });

      // Create wallet for new user
      await Wallet.create({
        user: user._id,
        balance: 0,
        monthlyBudgetCap: 0
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}&onboarding=${!user.onboardingCompleted}`);

  } catch (error) {
    console.error('Microsoft OAuth Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error?message=auth_failed`);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wallet');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Complete user onboarding
// @route   POST /api/auth/onboarding
// @access  Private
export const completeOnboarding = asyncHandler(async (req, res) => {
  const { monthlyBudgetCap, nutritionalGoal, preferredPaymentMethod } = req.body;

  // Validate inputs
  if (!monthlyBudgetCap || monthlyBudgetCap < 0) {
    throw new ErrorResponse('Please provide a valid monthly budget cap', 400);
  }

  if (!['High Energy', 'Balanced', 'Light Focused', 'None'].includes(nutritionalGoal)) {
    throw new ErrorResponse('Invalid nutritional goal', 400);
  }

  // Update user
  const user = await User.findById(req.user.id);
  user.monthlyBudgetCap = monthlyBudgetCap;
  user.nutritionalGoal = nutritionalGoal;
  user.preferredPaymentMethod = preferredPaymentMethod || 'cash_on_delivery';
  user.onboardingCompleted = true;
  await user.save();

  // Update wallet
  const wallet = await Wallet.findOne({ user: user._id });
  if (wallet) {
    wallet.monthlyBudgetCap = monthlyBudgetCap;
    await wallet.save();
  }

  res.json({
    success: true,
    message: 'Onboarding completed successfully',
    data: user
  });
});
