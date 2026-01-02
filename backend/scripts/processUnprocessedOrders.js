import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, WellnessTracking } from '../models/index.js';

// Load environment variables
dotenv.config();

const processUnprocessedOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all completed or paid orders that haven't been processed
    const unprocessedOrders = await Order.find({
      status: { $in: ['completed', 'paid'] },
      wellnessProcessed: { $ne: true }
    }).populate('student', 'email');

    console.log(`📊 Found ${unprocessedOrders.length} unprocessed orders`);

    let processedCount = 0;
    let errorCount = 0;

    for (const order of unprocessedOrders) {
      try {
        console.log(`\n🔄 Processing order ${order.orderNumber} for user ${order.student?.email || order.student}`);

        // Get user ID
        const userId = order.student._id ? order.student._id.toString() : order.student.toString();

        // Get the date of the order (use createdAt or pickupTimeSlot)
        const orderDate = order.pickupTimeSlot || order.createdAt;
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(orderDay);
        nextDay.setDate(nextDay.getDate() + 1);

        // Find or create wellness tracking for that day
        let tracking = await WellnessTracking.findOne({
          user: userId,
          date: {
            $gte: orderDay,
            $lt: nextDay
          }
        });

        if (!tracking) {
          console.log(`   Creating wellness tracking for ${orderDay.toDateString()}`);
          tracking = await WellnessTracking.create({
            user: userId,
            date: orderDay,
            day: orderDay.getDate(),
            month: orderDay.getMonth() + 1,
            year: orderDay.getFullYear()
          });
        }

        // Log before update
        console.log(`   Before: ${tracking.dailyCalories} cal, ${tracking.dailyProteins}g protein, ${tracking.dailySpent} DH`);

        // Update wellness tracking
        await tracking.addOrderStats(
          order.totalCalories || 0,
          order.totalProteins || 0,
          order.totalCarbs || 0,
          order.totalPrice || 0
        );

        // Mark order as processed (use updateOne to avoid validation issues)
        await Order.updateOne(
          { _id: order._id },
          { $set: { wellnessProcessed: true } }
        );

        // Verify the update
        const updatedTracking = await WellnessTracking.findById(tracking._id);
        console.log(`   After: ${updatedTracking.dailyCalories} cal, ${updatedTracking.dailyProteins}g protein, ${updatedTracking.dailySpent} DH`);
        console.log(`   ✅ Successfully processed order ${order.orderNumber}`);

        processedCount++;
      } catch (error) {
        console.error(`   ❌ Error processing order ${order.orderNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total orders found: ${unprocessedOrders.length}`);
    console.log(`   Successfully processed: ${processedCount}`);
    console.log(`   Errors: ${errorCount}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Script completed and disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
};

// Run the script
processUnprocessedOrders();
