import mongoose from 'mongoose';

const userReportSchema = new mongoose.Schema({
  // User being reported
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported user is required']
  },

  // Staff member who created the report
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },

  // Type of issue
  reportType: {
    type: String,
    enum: ['payment_dispute', 'behavioral_issue', 'technical_problem', 'fraud_suspicion', 'other'],
    required: [true, 'Report type is required']
  },

  // Description of the issue
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },

  // Admin notes and resolution
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },

  // Admin who resolved the report
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  resolvedAt: {
    type: Date
  },

  // Related order (if applicable)
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userReportSchema.index({ reportedUser: 1, status: 1 });
userReportSchema.index({ reportedBy: 1 });
userReportSchema.index({ status: 1, createdAt: -1 });

const UserReport = mongoose.model('UserReport', userReportSchema);

export default UserReport;
