import ExternalMeal from '../models/ExternalMeal.js';
import WellnessTracking from '../models/WellnessTracking.js';

// Create a new external meal
export const createExternalMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, price, calories, proteins, carbs, mealDate, notes, mealType, location } = req.body;

    console.log(`\n=Ý Creating external meal for user ${req.user.email}`);
    console.log(`   Title: ${title}`);
    console.log(`   Nutritional: ${calories} cal, ${proteins}g protein, ${carbs}g carbs`);
    console.log(`   Price: ${price} DH`);

    // Create external meal
    const externalMeal = await ExternalMeal.create({
      user: userId,
      name: title, // Map title to name
      cost: price || 0,
      nutritionalInfo: {
        calories: calories || 0,
        proteins: proteins || 0,
        carbohydrates: carbs || 0,
        fats: 0 // Can be added later if needed
      },
      consumedAt: mealDate || new Date(),
      mealType: mealType || 'Other',
      location: location || '',
      description: notes || ''
    });

    console.log(`    External meal created: ${externalMeal._id}`);

    // Update wellness tracking for that day
    try {
      const mealDateObj = new Date(mealDate || new Date());
      const startOfDay = new Date(mealDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(mealDateObj);
      endOfDay.setHours(23, 59, 59, 999);

      let tracking = await WellnessTracking.findOne({
        user: userId,
        date: { $gte: startOfDay, $lt: endOfDay }
      });

      if (!tracking) {
        console.log(`   =Ý Creating wellness tracking for ${startOfDay.toDateString()}`);
        tracking = await WellnessTracking.create({
          user: userId,
          date: startOfDay,
          day: startOfDay.getDate(),
          month: startOfDay.getMonth() + 1,
          year: startOfDay.getFullYear()
        });
      }

      console.log(`   =È Before: ${tracking.dailyCalories} cal, ${tracking.dailyProteins}g protein, ${tracking.dailySpent} DH`);

      // Update wellness tracking
      await tracking.addOrderStats(
        calories || 0,
        proteins || 0,
        carbs || 0,
        price || 0
      );

      const updatedTracking = await WellnessTracking.findById(tracking._id);
      console.log(`   =Ê After: ${updatedTracking.dailyCalories} cal, ${updatedTracking.dailyProteins}g protein, ${updatedTracking.dailySpent} DH`);
      console.log(`    Wellness tracking updated`);

    } catch (wellnessError) {
      console.error('      Error updating wellness tracking:', wellnessError.message);
      // Don't fail the request if wellness tracking fails
    }

    res.status(201).json({
      success: true,
      data: externalMeal
    });
  } catch (error) {
    console.error('L Error creating external meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating external meal',
      error: error.message
    });
  }
};

// Get all external meals for the authenticated user
export const getMyExternalMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit = 50 } = req.query;

    let query = { user: userId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.consumedAt = {};
      if (startDate) {
        query.consumedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.consumedAt.$lte = end;
      }
    }

    const externalMeals = await ExternalMeal.find(query)
      .sort({ consumedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Transform data to match frontend expectations
    const transformedMeals = externalMeals.map(meal => ({
      _id: meal._id,
      title: meal.name,
      price: meal.cost,
      calories: meal.nutritionalInfo?.calories || 0,
      proteins: meal.nutritionalInfo?.proteins || 0,
      carbs: meal.nutritionalInfo?.carbohydrates || 0,
      mealDate: meal.consumedAt,
      notes: meal.description,
      mealType: meal.mealType,
      location: meal.location,
      createdAt: meal.createdAt,
      isExternal: true // Flag to identify external meals
    }));

    res.json({
      success: true,
      count: transformedMeals.length,
      data: transformedMeals
    });
  } catch (error) {
    console.error('Error getting external meals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching external meals',
      error: error.message
    });
  }
};

// Get a single external meal
export const getExternalMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const externalMeal = await ExternalMeal.findOne({
      _id: id,
      user: userId
    }).lean();

    if (!externalMeal) {
      return res.status(404).json({
        success: false,
        message: 'External meal not found'
      });
    }

    // Transform to match frontend expectations
    const transformed = {
      _id: externalMeal._id,
      title: externalMeal.name,
      price: externalMeal.cost,
      calories: externalMeal.nutritionalInfo?.calories || 0,
      proteins: externalMeal.nutritionalInfo?.proteins || 0,
      carbs: externalMeal.nutritionalInfo?.carbohydrates || 0,
      mealDate: externalMeal.consumedAt,
      notes: externalMeal.description,
      mealType: externalMeal.mealType,
      location: externalMeal.location,
      createdAt: externalMeal.createdAt,
      isExternal: true
    };

    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    console.error('Error getting external meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching external meal',
      error: error.message
    });
  }
};

// Update an external meal
export const updateExternalMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, price, calories, proteins, carbs, mealDate, notes, mealType, location } = req.body;

    const externalMeal = await ExternalMeal.findOne({
      _id: id,
      user: userId
    });

    if (!externalMeal) {
      return res.status(404).json({
        success: false,
        message: 'External meal not found'
      });
    }

    // Update fields
    if (title !== undefined) externalMeal.name = title;
    if (price !== undefined) externalMeal.cost = price;
    if (mealDate !== undefined) externalMeal.consumedAt = mealDate;
    if (notes !== undefined) externalMeal.description = notes;
    if (mealType !== undefined) externalMeal.mealType = mealType;
    if (location !== undefined) externalMeal.location = location;

    if (calories !== undefined || proteins !== undefined || carbs !== undefined) {
      externalMeal.nutritionalInfo = {
        calories: calories !== undefined ? calories : externalMeal.nutritionalInfo.calories,
        proteins: proteins !== undefined ? proteins : externalMeal.nutritionalInfo.proteins,
        carbohydrates: carbs !== undefined ? carbs : externalMeal.nutritionalInfo.carbohydrates,
        fats: externalMeal.nutritionalInfo.fats
      };
    }

    await externalMeal.save();

    console.log(` Updated external meal ${id} for user ${req.user.email}`);

    res.json({
      success: true,
      data: externalMeal
    });
  } catch (error) {
    console.error('Error updating external meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating external meal',
      error: error.message
    });
  }
};

// Delete an external meal
export const deleteExternalMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const externalMeal = await ExternalMeal.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!externalMeal) {
      return res.status(404).json({
        success: false,
        message: 'External meal not found'
      });
    }

    console.log(`=Ñ  Deleted external meal ${id} for user ${req.user.email}`);

    res.json({
      success: true,
      message: 'External meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting external meal',
      error: error.message
    });
  }
};
