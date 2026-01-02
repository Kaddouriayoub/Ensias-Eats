import WellnessTracking from '../models/WellnessTracking.js';
import User from '../models/User.js';

// Get wellness data for the authenticated user
export const getMyWellnessData = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { date } = req.query;

    console.log(`\n🔍 GET /wellness/me called`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Date param: ${date || 'today'}`);

    let query = { user: userId };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    } else {
      // Default to today's data
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    let wellnessData = await WellnessTracking.findOne(query)
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!wellnessData) {
      // Create a new entry if none exists for the requested date
      const requestedDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);

      try {
        wellnessData = await WellnessTracking.create({
          user: userId,
          date: startOfDay,
          day: startOfDay.getDate(),
          month: startOfDay.getMonth() + 1,
          year: startOfDay.getFullYear()
        });
      } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
          console.log(`   ⚠️  Duplicate key error, re-querying for existing record`);
          wellnessData = await WellnessTracking.findOne(query).lean();
        } else {
          throw error;
        }
      }
    }

    // Get user's nutritional goal
    const user = await User.findById(userId).select('nutritionalGoal monthlyBudgetCap');

    // Get monthly stats
    const today = new Date();
    const monthlyStats = await WellnessTracking.getMonthlyStats(
      userId,
      today.getFullYear(),
      today.getMonth() + 1
    );

    const response = {
      ...wellnessData.toObject ? wellnessData.toObject() : wellnessData,
      nutritionalGoal: user?.nutritionalGoal || 'Balanced',
      monthlyBudgetCap: user?.monthlyBudgetCap || 0,
      monthlyStats
    };

    console.log(`📊 Wellness data for user ${userId}:`);
    console.log(`   Daily: ${response.dailyCalories} cal, ${response.dailyProteins}g protein, ${response.dailySpent} DH`);
    console.log(`   Monthly: ${monthlyStats.totalCalories} cal, ${monthlyStats.totalProteins}g protein, ${monthlyStats.totalSpent} DH`);

    res.json(response);
  } catch (error) {
    console.error('Error getting my wellness data:', error);
    res.status(500).json({ message: 'Server error while fetching wellness data' });
  }
};

export const getWellnessData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    let query = { user: userId };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    } else {
      // Default to today's data
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    let wellnessData = await WellnessTracking.findOne(query)
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!wellnessData) {
      // Create a new entry if none exists for the requested date
      const requestedDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);

      try {
        wellnessData = await WellnessTracking.create({
          user: userId,
          date: startOfDay,
          day: startOfDay.getDate(),
          month: startOfDay.getMonth() + 1,
          year: startOfDay.getFullYear()
        });
      } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
          console.log(`   ⚠️  Duplicate key error, re-querying for existing record`);
          wellnessData = await WellnessTracking.findOne(query).lean();
        } else {
          throw error;
        }
      }
    }

    // Get user's monthly budget
    const user = await User.findById(userId).select('monthlyBudgetCap');

    // Get monthly stats
    const today = new Date();
    const monthlyStats = await WellnessTracking.getMonthlyStats(
      userId,
      today.getFullYear(),
      today.getMonth() + 1
    );

    const response = {
      ...wellnessData.toObject ? wellnessData.toObject() : wellnessData,
      monthlyBudgetCap: user?.monthlyBudgetCap || 0,
      monthlyStats
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting wellness data:', error);
    res.status(500).json({ message: 'Server error while fetching wellness data' });
  }
};

export const getMonthlyWellnessData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month parameters are required' });
    }

    const monthlyData = await WellnessTracking.getMonthlyStats(userId, parseInt(year), parseInt(month));

    // Get user's monthly budget
    const user = await User.findById(userId).select('monthlyBudgetCap');

    res.json({
      ...monthlyData,
      monthlyBudgetCap: user?.monthlyBudgetCap || 0
    });
  } catch (error) {
    console.error('Error getting monthly wellness data:', error);
    res.status(500).json({ message: 'Server error while fetching monthly wellness data' });
  }
};

export const updateDailyGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { calorieGoal, proteinGoal, carbGoal } = req.body;
    
    if (!calorieGoal && !proteinGoal && !carbGoal) {
      return res.status(400).json({ message: 'At least one goal must be provided' });
    }
    
    const today = new Date();
    const query = {
      user: userId,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    };
    
    const update = {};
    if (calorieGoal) update.calorieGoal = calorieGoal;
    if (proteinGoal) update.proteinGoal = proteinGoal;
    if (carbGoal) update.carbGoal = carbGoal;
    
    const options = { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    };
    
    // Add date fields if upserting
    if (options.upsert) {
      update.day = today.getDate();
      update.month = today.getMonth() + 1;
      update.year = today.getFullYear();
    }
    
    const updatedTracking = await WellnessTracking.findOneAndUpdate(
      query,
      update,
      options
    );
    
    res.json(updatedTracking);
  } catch (error) {
    console.error('Error updating daily goals:', error);
    res.status(500).json({ message: 'Server error while updating daily goals' });
  }
};
