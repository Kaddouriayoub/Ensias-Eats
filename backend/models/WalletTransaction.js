import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  // User whose wallet was affected
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },

  // Wallet reference
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: [true, 'Wallet is required']
  },

  // Transaction type
  type: {
    type: String,
    enum: ['charge', 'debit', 'refund'],
    required: [true, 'Transaction type is required']
  },

  // Amount (positive for charge/refund, positive for debit but will be subtracted)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },

  // Balance after transaction
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },

  // Staff/admin who processed the transaction
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Processor is required']
  },

  // Payment method (for charges)
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'other'],
    default: 'cash'
  },

  // Reference number (receipt/transaction ID)
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Related order (for debits)
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });
walletTransactionSchema.index({ processedBy: 1 });
walletTransactionSchema.index({ type: 1, status: 1 });

// Generate unique reference number before saving
walletTransactionSchema.pre('save', function(next) {
  if (!this.referenceNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.referenceNumber = `WTX-${timestamp}${random}`.toUpperCase();
  }
  next();
});

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
