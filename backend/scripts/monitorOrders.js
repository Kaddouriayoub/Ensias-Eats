import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, WellnessTracking } from '../models/index.js';

// Load environment variables
dotenv.config();

let isProcessing = false;

const processUnprocessedOrders = async () => {
  // Prevent concurrent processing
  if (isProcessing) {
    console.log('⏭️  Skipping - already processing orders');
    return;
  }

  isProcessing = true;

  try {
    // Find all completed or paid orders that haven't been processed
    const unprocessedOrders = await Order.find({
      status: { $in: ['completed', 'paid'] },
      wellnessProcessed: { $ne: true }
    }).populate('student', 'email');

    if (unprocessedOrders.length === 0) {
      console.log('✅ No unprocessed orders found');
      isProcessing = false;
      return;
    }

    console.log(`\n📊 Found ${unprocessedOrders.length} unprocessed orders - processing...`);

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
          console.log(`   📝 Creating wellness tracking for ${orderDay.toDateString()}`);
          tracking = await WellnessTracking.create({
            user: userId,
            date: orderDay,
            day: orderDay.getDate(),
            month: orderDay.getMonth() + 1,
            year: orderDay.getFullYear()
          });
        }

        // Log before update
        console.log(`   📈 Before: ${tracking.dailyCalories} cal, ${tracking.dailyProteins}g protein, ${tracking.dailySpent} DH`);

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
        console.log(`   📊 After: ${updatedTracking.dailyCalories} cal, ${updatedTracking.dailyProteins}g protein, ${updatedTracking.dailySpent} DH`);
        console.log(`   ✅ Successfully processed order ${order.orderNumber}`);

        processedCount++;
      } catch (error) {
        console.error(`   ❌ Error processing order ${order.orderNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Processing complete:`);
    console.log(`   ✅ Successfully processed: ${processedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error in processUnprocessedOrders:', error);
  } finally {
    isProcessing = false;
  }
};

const startMonitoring = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Starting order monitoring service...\n');

    // Process immediately on start
    await processUnprocessedOrders();

    // Then check every 30 seconds
    const intervalMinutes = 0.5; // 30 seconds
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`\n⏰ Monitoring every ${intervalMinutes * 60} seconds for unprocessed orders...`);
    console.log('   Press Ctrl+C to stop\n');

    setInterval(async () => {
      const now = new Date().toLocaleTimeString();
      console.log(`\n🕐 [${now}] Checking for unprocessed orders...`);
      await processUnprocessedOrders();
    }, intervalMs);

  } catch (error) {
    console.error('❌ Failed to start monitoring:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down order monitoring service...');
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
});

// Start the monitoring service
startMonitoring();
