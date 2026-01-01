import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Wallet, Meal, TimeSlot } from '../models/index.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Meal.deleteMany({});
    await TimeSlot.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create test users
    const studentUser = await User.create({
      name: 'Ayoub El Alaoui',
      email: 'ayoub.elalaoui@um5.ac.ma',
      password: 'password123',
      role: 'student',
      nutritionalGoal: 'Balanced',
      monthlyBudgetCap: 500,
      onboardingCompleted: true,
      preferredPaymentMethod: 'wallet'
    });

    const cafeteriaStaff = await User.create({
      name: 'Fatima Zahra',
      email: 'fatima.zahra@um5.ac.ma',
      password: 'password123',
      role: 'cafeteria_staff',
      onboardingCompleted: true
    });

    const adminUser = await User.create({
      name: 'Mohammed Admin',
      email: 'admin@um5.ac.ma',
      password: 'password123',
      role: 'admin',
      onboardingCompleted: true
    });

    console.log('✅ Created users');

    // Create wallets for students
    await Wallet.create({
      user: studentUser._id,
      balance: 200,
      monthlyBudgetCap: 500,
      currentMonthSpent: 0
    });

    console.log('✅ Created wallets');

    // Create meals
    const meals = await Meal.insertMany([
      {
        name: 'Couscous Royal',
        description: 'Couscous traditionnel avec légumes et viande',
        price: 25,
        nutritionalInfo: {
          calories: 650,
          proteins: 35,
          carbohydrates: 85,
          fats: 15,
          fiber: 8
        },
        category: 'Main Course',
        isAvailable: true,
        availableDays: [1, 3, 5], // Lundi, Mercredi, Vendredi
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isHalal: true
        },
        tags: ['traditional', 'popular', 'protein-rich'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Tagine Poulet',
        description: 'Tagine de poulet aux olives et citron confit',
        price: 30,
        nutritionalInfo: {
          calories: 580,
          proteins: 42,
          carbohydrates: 45,
          fats: 22,
          fiber: 6
        },
        category: 'Main Course',
        isAvailable: true,
        availableDays: [2, 4], // Mardi, Jeudi
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isHalal: true
        },
        tags: ['traditional', 'gluten-free'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Salade Méditerranéenne',
        description: 'Salade fraîche avec thon, œufs et légumes',
        price: 20,
        nutritionalInfo: {
          calories: 320,
          proteins: 25,
          carbohydrates: 18,
          fats: 15,
          fiber: 5
        },
        category: 'Salad',
        isAvailable: true,
        availableDays: [1, 2, 3, 4, 5],
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true,
          isHalal: true
        },
        tags: ['light', 'fresh', 'healthy'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Soupe Harira',
        description: 'Soupe traditionnelle marocaine',
        price: 12,
        nutritionalInfo: {
          calories: 280,
          proteins: 15,
          carbohydrates: 42,
          fats: 6,
          fiber: 8
        },
        category: 'Main Course',
        isAvailable: true,
        availableDays: [1, 2, 3, 4, 5],
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isHalal: true
        },
        tags: ['traditional', 'soup', 'light'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Sandwich Poulet',
        description: 'Sandwich au poulet grillé avec crudités',
        price: 18,
        nutritionalInfo: {
          calories: 450,
          proteins: 28,
          carbohydrates: 52,
          fats: 12,
          fiber: 4
        },
        category: 'Snack',
        isAvailable: true,
        availableDays: [1, 2, 3, 4, 5],
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isHalal: true
        },
        tags: ['quick', 'sandwich'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Jus Orange Frais',
        description: 'Jus d\'orange fraîchement pressé',
        price: 8,
        nutritionalInfo: {
          calories: 110,
          proteins: 2,
          carbohydrates: 26,
          fats: 0,
          fiber: 0
        },
        category: 'Beverage',
        isAvailable: true,
        availableDays: [1, 2, 3, 4, 5],
        dietary: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: true,
          isHalal: true
        },
        tags: ['fresh', 'vitamin-c'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Yaourt Nature',
        description: 'Yaourt nature bio',
        price: 5,
        nutritionalInfo: {
          calories: 80,
          proteins: 8,
          carbohydrates: 10,
          fats: 2,
          fiber: 0
        },
        category: 'Dessert',
        isAvailable: true,
        availableDays: [1, 2, 3, 4, 5],
        dietary: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: true,
          isHalal: true
        },
        tags: ['healthy', 'protein'],
        createdBy: cafeteriaStaff._id
      },
      {
        name: 'Pastilla Poulet',
        description: 'Pastilla traditionnelle au poulet',
        price: 35,
        nutritionalInfo: {
          calories: 720,
          proteins: 38,
          carbohydrates: 68,
          fats: 32,
          fiber: 4
        },
        category: 'Main Course',
        isAvailable: true,
        availableDays: [5], // Vendredi
        dietary: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isHalal: true
        },
        tags: ['traditional', 'special', 'festive'],
        createdBy: cafeteriaStaff._id
      }
    ]);

    console.log('✅ Created meals');

    // Create time slots for the week
    const timeSlots = [];
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const slots = [
      { start: '12:00', end: '12:30', max: 30 },
      { start: '12:30', end: '13:00', max: 40 },
      { start: '13:00', end: '13:30', max: 40 },
      { start: '13:30', end: '14:00', max: 30 },
      { start: '14:00', end: '14:30', max: 20 }
    ];

    for (const day of days) {
      for (const slot of slots) {
        timeSlots.push({
          startTime: slot.start,
          endTime: slot.end,
          dayOfWeek: day,
          maxOrders: slot.max,
          currentOrders: 0,
          isAvailable: true,
          description: `Lunch slot ${slot.start} - ${slot.end}`
        });
      }
    }

    await TimeSlot.insertMany(timeSlots);
    console.log('✅ Created time slots');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: 3 (1 student, 1 staff, 1 admin)`);
    console.log(`   Meals: ${meals.length}`);
    console.log(`   Time Slots: ${timeSlots.length}`);
    console.log('\n👤 Test Credentials:');
    console.log('   Student: ayoub.elalaoui@um5.ac.ma / password123');
    console.log('   Staff: fatima.zahra@um5.ac.ma / password123');
    console.log('   Admin: admin@um5.ac.ma / password123');
    console.log('\n⚠️  Note: Use Microsoft OAuth for production');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
