import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  // Time slot start and end times
  startTime: {
    type: String, // Format: "HH:MM" (e.g., "12:00")
    required: true
  },
  endTime: {
    type: String, // Format: "HH:MM" (e.g., "12:30")
    required: true
  },

  // Date (if time slots are date-specific)
  date: {
    type: Date,
    default: null // null means recurring daily
  },

  // Capacity management
  maxOrders: {
    type: Number,
    default: 50,
    min: 1
  },
  currentOrders: {
    type: Number,
    default: 0,
    min: 0
  },

  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },

  // Day of week (0 = Sunday, 6 = Saturday) for recurring slots
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: null
  },

  // Description
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
timeSlotSchema.index({ date: 1, startTime: 1 });
timeSlotSchema.index({ dayOfWeek: 1, startTime: 1 });

// Method to check if slot is full
timeSlotSchema.methods.isFull = function() {
  return this.currentOrders >= this.maxOrders;
};

// Method to check if slot is available
timeSlotSchema.methods.isAvailableForBooking = function() {
  return this.isAvailable && !this.isFull();
};

// Method to increment order count
timeSlotSchema.methods.incrementOrders = async function() {
  if (this.isFull()) {
    throw new Error('Time slot is full');
  }
  this.currentOrders += 1;
  return await this.save();
};

// Method to decrement order count (when order is cancelled)
timeSlotSchema.methods.decrementOrders = async function() {
  if (this.currentOrders > 0) {
    this.currentOrders -= 1;
    return await this.save();
  }
};

// Method to get remaining capacity
timeSlotSchema.methods.getRemainingCapacity = function() {
  return Math.max(0, this.maxOrders - this.currentOrders);
};

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot;
