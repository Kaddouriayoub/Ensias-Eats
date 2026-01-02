import mongoose from 'mongoose';

const wellnessTrackingSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Date tracking
  date: {
    type: Date,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },

  // Daily nutrition intake
  dailyCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyProteins: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyCarbs: {
    type: Number,
    default: 0,
    min: 0
  },

  // Daily spending
  dailySpent: {
    type: Number,
    default: 0,
    min: 0
  },

  // Monthly totals (updated automatically)
  monthlyCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyProteins: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlySpent: {
    type: Number,
    default: 0,
    min: 0
  },

  // Number of orders completed today
  ordersCompletedToday: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index for unique user + date
wellnessTrackingSchema.index({ user: 1, date: 1 }, { unique: true });
wellnessTrackingSchema.index({ user: 1, year: 1, month: 1 });

// Static method to get or create today's tracking
wellnessTrackingSchema.statics.getTodayTracking = async function(userId) {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // Use date range to find today's tracking
  let tracking = await this.findOne({
    user: userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  if (!tracking) {
    // Create new tracking with start of day
    tracking = await this.create({
      user: userId,
      date: startOfDay,
      day: startOfDay.getDate(),
      month: startOfDay.getMonth() + 1,
      year: startOfDay.getFullYear()
    });
  }

  return tracking;
};

// Static method to get monthly stats
wellnessTrackingSchema.statics.getMonthlyStats = async function(userId, year, month) {
  const stats = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        year: year,
        month: month
      }
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: '$dailyCalories' },
        totalProteins: { $sum: '$dailyProteins' },
        totalSpent: { $sum: '$dailySpent' },
        totalOrders: { $sum: '$ordersCompletedToday' },
        daysWithOrders: { $sum: { $cond: [{ $gt: ['$ordersCompletedToday', 0] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    totalCalories: 0,
    totalProteins: 0,
    totalSpent: 0,
    totalOrders: 0,
    daysWithOrders: 0
  };
};

wellnessTrackingSchema.methods.addOrderStats = async function(calories, proteins, carbs, price) {
  try {
    // Ensure all values are numbers
    const cal = Number(calories) || 0;
    const prot = Number(proteins) || 0;
    const carb = Number(carbs) || 0;
    const amount = Number(price) || 0;

    // Update all fields atomically
    const result = await this.constructor.findByIdAndUpdate(
      this._id,
      {
        $inc: {
          dailyCalories: cal,
          dailyProteins: prot,
          dailyCarbs: carb,
          dailySpent: amount,
          monthlyCalories: cal,
          monthlyProteins: prot,
          monthlySpent: amount,
          ordersCompletedToday: 1
        }
      },
      { new: true } // Return the updated document
    );

    if (!result) {
      throw new Error('Failed to update wellness tracking');
    }

    // Update the current document instance with the latest values
    Object.assign(this, result.toObject());

    return result;
  } catch (error) {
    console.error('Error in addOrderStats:', error);
    throw error; // Re-throw to allow calling function to handle it
  }
};

const WellnessTracking = mongoose.model('WellnessTracking', wellnessTrackingSchema);

export default WellnessTracking;
