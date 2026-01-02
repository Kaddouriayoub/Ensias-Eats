import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const completeOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Update all pending orders to completed
    const result = await Order.updateMany(
      { status: 'pending' },
      { $set: { status: 'completed' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} orders to completed status`);

    // Show all orders
    const orders = await Order.find();
    console.log('\n📦 All orders:');
    orders.forEach(order => {
      console.log(`   Order ${order.orderNumber}: ${order.status} - ${order.totalPrice} DH (${order.totalCalories} cal, ${order.totalProteins}g protein)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

completeOrders();
