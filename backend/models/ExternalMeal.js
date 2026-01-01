import mongoose from 'mongoose';

const externalMealSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Meal Information
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

  // Nutritional Information (manually entered by student)
  nutritionalInfo: {
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    proteins: {
      type: Number,
      default: 0,
      min: 0
    },
    carbohydrates: {
      type: Number,
      default: 0,
      min: 0
    },
    fats: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Optional cost (for budget tracking)
  cost: {
    type: Number,
    default: 0,
    min: 0
  },

  // Meal time/date
  consumedAt: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Meal type
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'],
    default: 'Other'
  },

  // Location (optional)
  location: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
externalMealSchema.index({ user: 1, consumedAt: -1 });
externalMealSchema.index({ user: 1, createdAt: -1 });

const ExternalMeal = mongoose.model('ExternalMeal', externalMealSchema);

export default ExternalMeal;
