import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default in queries
  },

  // UM5 Institutional Account
  um5AccountId: {
    type: String,
    unique: true,
    sparse: true // Allow null values while maintaining uniqueness
  },

  // Role-based access
  role: {
    type: String,
    enum: ['student', 'cafeteria_staff', 'admin'],
    default: 'student'
  },

  // Nutritional Preferences (for students)
  nutritionalGoal: {
    type: String,
    enum: ['High Energy', 'Balanced', 'Light Focused', 'None'],
    default: 'None'
  },

  // Budget Management
  monthlyBudgetCap: {
    type: Number,
    default: 0,
    min: 0
  },
  currentMonthSpent: {
    type: Number,
    default: 0,
    min: 0
  },

  // Wallet Reference
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },

  // Profile completion status
  onboardingCompleted: {
    type: Boolean,
    default: false
  },

  // Preferences
  preferredPaymentMethod: {
    type: String,
    enum: ['wallet', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },

  // Tracking
  dailyCalorieIntake: {
    type: Number,
    default: 0
  },
  dailyProteinIntake: {
    type: Number,
    default: 0
  },
  lastIntakeReset: {
    type: Date,
    default: Date.now
  },

  // Account Suspension (Admin Feature)
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date
  },
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  suspensionReason: {
    type: String
  },

  // Activity Tracking
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to reset daily intake (called at midnight)
userSchema.methods.resetDailyIntake = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(this.lastIntakeReset);
  lastReset.setHours(0, 0, 0, 0);

  if (today > lastReset) {
    this.dailyCalorieIntake = 0;
    this.dailyProteinIntake = 0;
    this.lastIntakeReset = Date.now();
  }
};

// Method to reset monthly spending (called at start of new month)
userSchema.methods.resetMonthlySpending = function() {
  const now = new Date();
  const lastMonth = new Date(this.updatedAt);

  if (now.getMonth() !== lastMonth.getMonth() || now.getFullYear() !== lastMonth.getFullYear()) {
    this.currentMonthSpent = 0;
  }
};

const User = mongoose.model('User', userSchema);

export default User;
