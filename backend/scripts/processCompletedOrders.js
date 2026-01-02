import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order } from '../models/Order.js';
import { WellnessTracking } from '../models/WellnessTracking.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Process completed orders that haven't been tracked yet
const processCompletedOrders = async () => {
  try {
    console.log('Looking for completed orders to process...');
    
    // Find all completed orders that don't have wellnessProcessed flag or have it set to false
    const orders = await Order.find({
      $or: [
        { status: 'completed', wellnessProcessed: { $exists: false } },
        { status: 'completed', wellnessProcessed: false }
      ]
    });

    console.log(`Found ${orders.length} orders to process`);

    for (const order of orders) {
      try {
        console.log(`Processing order ${order._id} for user ${order.student}`);
        
        // Get or create wellness tracking for the order date
        const orderDate = order.updatedAt || order.createdAt;
        const tracking = await WellnessTracking.findOneAndUpdate(
          {
            user: order.student,
            day: orderDate.getDate(),
            month: orderDate.getMonth() + 1,
            year: orderDate.getFullYear()
          },
          {
            $setOnInsert: {
              date: new Date(
                orderDate.getFullYear(),
                orderDate.getMonth(),
                orderDate.getDate()
              ),
              user: order.student,
              day: orderDate.getDate(),
              month: orderDate.getMonth() + 1,
              year: orderDate.getFullYear(),
              dailyCalories: 0,
              dailyProteins: 0,
              dailyCarbs: 0,
              dailySpent: 0,
              monthlyCalories: 0,
              monthlyProteins: 0,
              monthlySpent: 0,
              ordersCompletedToday: 0
            }
          },
          { upsert: true, new: true }
        );

        // Update the tracking with order data
        await tracking.updateOne({
          $inc: {
            dailyCalories: order.totalCalories || 0,
            dailyProteins: order.totalProteins || 0,
            dailyCarbs: order.totalCarbs || 0,
            dailySpent: order.totalPrice || 0,
            monthlyCalories: order.totalCalories || 0,
            monthlyProteins: order.totalProteins || 0,
            monthlySpent: order.totalPrice || 0,
            ordersCompletedToday: 1
          }
        });

        // Mark order as processed
        order.wellnessProcessed = true;
        await order.save();
        
        console.log(`✅ Processed order ${order._id}`);
      } catch (error) {
        console.error(`❌ Error processing order ${order._id}:`, error);
      }
    }

    console.log('Completed processing orders');
    process.exit(0);
  } catch (error) {
    console.error('Error in processCompletedOrders:', error);
    process.exit(1);
  }
};

// Run the script
(async () => {
  await connectDB();
  await processCompletedOrders();
})();
