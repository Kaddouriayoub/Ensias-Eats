import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Wallet Reference
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },

  // User Reference (for easier querying)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Transaction Type
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },

  // Amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Description
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Order Reference (if transaction is related to an order)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['wallet', 'cash_on_delivery', 'wallet_recharge'],
    default: null
  },

  // Balance After Transaction
  balanceAfter: {
    type: Number,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },

  // Additional metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
