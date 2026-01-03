import mongoose from 'mongoose';

const nutritionalInfoSchema = new mongoose.Schema({
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  proteins: {
    type: Number,
    required: true,
    min: 0
  },
  carbohydrates: {
    type: Number,
    required: true,
    min: 0
  },
  fats: {
    type: Number,
    default: 0,
    min: 0
  },
  fiber: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const mealSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },

  // Cost and Profit (for admin profit tracking)
  cost: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Net cost of ingredients/preparation'
  },
  profitMargin: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Calculated as: price - cost'
  },

  // Nutritional Information
  nutritionalInfo: {
    type: nutritionalInfoSchema,
    required: true
  },

  // Category
  category: {
    type: String,
    enum: ['Main Course', 'Side Dish', 'Dessert', 'Beverage', 'Snack', 'Salad', 'Other'],
    default: 'Main Course'
  },

  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },

  // Available on specific days (0 = Sunday, 6 = Saturday)
  availableDays: {
    type: [Number],
    default: [1, 2, 3, 4, 5], // Monday to Friday
    validate: {
      validator: function(days) {
        return days.every(day => day >= 0 && day <= 6);
      },
      message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
    }
  },

  // Image
  image: {
    type: String,
    default: null
  },

  // Dietary information
  dietary: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: true }
  },

  // Popularity tracking
  orderCount: {
    type: Number,
    default: 0
  },

  // Rating (for future feature)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },

  // Created/Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
mealSchema.index({ isAvailable: 1, category: 1 });
mealSchema.index({ name: 'text', description: 'text' });

// Method to check if meal is available today
mealSchema.methods.isAvailableToday = function() {
  const today = new Date().getDay();
  return this.isAvailable && this.availableDays.includes(today);
};

// Method to increment order count
mealSchema.methods.incrementOrderCount = async function() {
  this.orderCount += 1;
  return await this.save();
};

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
