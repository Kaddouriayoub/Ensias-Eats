import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Wallet Balance
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Monthly Budget Cap (synced with User model)
  monthlyBudgetCap: {
    type: Number,
    default: 0,
    min: 0
  },

  // Current Month Spending (synced with User model)
  currentMonthSpent: {
    type: Number,
    default: 0,
    min: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Last transaction timestamp
  lastTransactionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Method to check if user can afford a purchase
walletSchema.methods.canAfford = function(amount) {
  return this.balance >= amount;
};

// Method to check if purchase exceeds monthly budget
walletSchema.methods.exceedsBudget = function(amount) {
  if (this.monthlyBudgetCap === 0) return false; // No budget cap set
  return (this.currentMonthSpent + amount) > this.monthlyBudgetCap;
};

// Method to get remaining budget for the month
walletSchema.methods.getRemainingBudget = function() {
  if (this.monthlyBudgetCap === 0) return Infinity;
  return Math.max(0, this.monthlyBudgetCap - this.currentMonthSpent);
};

// Method to add funds to wallet
walletSchema.methods.addFunds = async function(amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  this.balance += amount;
  this.lastTransactionDate = Date.now();
  return await this.save();
};

// Method to deduct funds from wallet
walletSchema.methods.deductFunds = async function(amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (this.balance < amount) throw new Error('Insufficient balance');

  this.balance -= amount;
  this.currentMonthSpent += amount;
  this.lastTransactionDate = Date.now();
  return await this.save();
};

// Reset monthly spending at the start of each month
walletSchema.methods.resetMonthlySpending = async function() {
  this.currentMonthSpent = 0;
  return await this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
