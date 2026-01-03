import mongoose from 'mongoose';
import Meal from '../models/Meal.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cafeteria meals data with nutritional estimates
const cafeteriaMeals = [
  // Main Courses - Pasta & Burgers
  {
    name: 'Pasticcio',
    description: 'Gratin de pâtes à la béchamel',
    price: 20,
    cost: 8,
    nutritionalInfo: {
      calories: 550,
      proteins: 25,
      carbohydrates: 60,
      fats: 22,
      fiber: 4
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
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500'
  },
  {
    name: 'Burger viande',
    description: 'Burger avec viande hachée',
    price: 18,
    cost: 7,
    nutritionalInfo: {
      calories: 520,
      proteins: 28,
      carbohydrates: 45,
      fats: 25,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'
  },
  {
    name: 'Sandwich avec frite + salade',
    description: 'Sandwich complet avec frites et salade',
    price: 18,
    cost: 6,
    nutritionalInfo: {
      calories: 650,
      proteins: 22,
      carbohydrates: 70,
      fats: 28,
      fiber: 5
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
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500'
  },

  // Paninis
  {
    name: 'Panini poulet hachée',
    description: 'Panini avec poulet haché',
    price: 18,
    cost: 6,
    nutritionalInfo: {
      calories: 480,
      proteins: 26,
      carbohydrates: 52,
      fats: 18,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500'
  },
  {
    name: 'Panini viande hachée',
    description: 'Panini avec viande hachée',
    price: 22,
    cost: 8,
    nutritionalInfo: {
      calories: 520,
      proteins: 28,
      carbohydrates: 50,
      fats: 22,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500'
  },
  {
    name: 'Panini poulet',
    description: 'Panini au poulet',
    price: 19,
    cost: 7,
    nutritionalInfo: {
      calories: 490,
      proteins: 27,
      carbohydrates: 51,
      fats: 19,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500'
  },

  // Shawarma & Tacos
  {
    name: 'Shawarma',
    description: 'Shawarma traditionnel',
    price: 17,
    cost: 6,
    nutritionalInfo: {
      calories: 450,
      proteins: 25,
      carbohydrates: 48,
      fats: 18,
      fiber: 4
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
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500'
  },
  {
    name: 'Tacos poulet',
    description: 'Tacos au poulet',
    price: 20,
    cost: 7,
    nutritionalInfo: {
      calories: 580,
      proteins: 30,
      carbohydrates: 55,
      fats: 24,
      fiber: 5
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500'
  },
  {
    name: 'Tacos nugget',
    description: 'Tacos avec nuggets de poulet',
    price: 22,
    cost: 8,
    nutritionalInfo: {
      calories: 620,
      proteins: 28,
      carbohydrates: 62,
      fats: 28,
      fiber: 4
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500'
  },
  {
    name: 'Tacos gratiné',
    description: 'Tacos gratiné au fromage',
    price: 22,
    cost: 8,
    nutritionalInfo: {
      calories: 650,
      proteins: 32,
      carbohydrates: 58,
      fats: 30,
      fiber: 4
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500'
  },
  {
    name: 'Tacos viande hachée',
    description: 'Tacos à la viande hachée',
    price: 20,
    cost: 7,
    nutritionalInfo: {
      calories: 600,
      proteins: 32,
      carbohydrates: 56,
      fats: 26,
      fiber: 5
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
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500'
  },

  // Boccadios
  {
    name: 'Boccadios thon',
    description: 'Petit pain au thon',
    price: 8,
    cost: 3,
    nutritionalInfo: {
      calories: 280,
      proteins: 18,
      carbohydrates: 35,
      fats: 8,
      fiber: 2
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'
  },
  {
    name: 'Boccadios plat',
    description: 'Boccadios version plat',
    price: 13,
    cost: 5,
    nutritionalInfo: {
      calories: 420,
      proteins: 22,
      carbohydrates: 48,
      fats: 15,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'
  },

  // Pizzas
  {
    name: 'Pizza thon',
    description: 'Pizza au thon',
    price: 15,
    cost: 5,
    nutritionalInfo: {
      calories: 480,
      proteins: 24,
      carbohydrates: 55,
      fats: 18,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500'
  },
  {
    name: 'Pizza viande hachée',
    description: 'Pizza à la viande hachée',
    price: 20,
    cost: 7,
    nutritionalInfo: {
      calories: 550,
      proteins: 28,
      carbohydrates: 58,
      fats: 22,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500'
  },
  {
    name: 'Pizza poulet',
    description: 'Pizza au poulet',
    price: 18,
    cost: 6,
    nutritionalInfo: {
      calories: 520,
      proteins: 26,
      carbohydrates: 56,
      fats: 20,
      fiber: 3
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
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500'
  },

  // Traditional Moroccan Dishes
  {
    name: 'Couscous au bœuf + verre de Lben',
    description: 'Couscous traditionnel au bœuf servi avec Lben',
    price: 25,
    cost: 10,
    nutritionalInfo: {
      calories: 680,
      proteins: 38,
      carbohydrates: 85,
      fats: 18,
      fiber: 8
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 3, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500'
  },
  {
    name: 'Couscous au poulet + verre de Lben',
    description: 'Couscous traditionnel au poulet servi avec Lben',
    price: 22,
    cost: 9,
    nutritionalInfo: {
      calories: 650,
      proteins: 35,
      carbohydrates: 82,
      fats: 16,
      fiber: 7
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 3, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500'
  },
  {
    name: 'Rfisa poulet',
    description: 'Rfisa marocaine au poulet',
    price: 20,
    cost: 8,
    nutritionalInfo: {
      calories: 580,
      proteins: 32,
      carbohydrates: 65,
      fats: 18,
      fiber: 6
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [2, 4],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'
  },
  {
    name: 'Seffa au poulet',
    description: 'Seffa sucrée au poulet',
    price: 18,
    cost: 7,
    nutritionalInfo: {
      calories: 620,
      proteins: 28,
      carbohydrates: 78,
      fats: 20,
      fiber: 5
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [2, 4],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'
  },
  {
    name: 'Tajine boulette kefta',
    description: 'Tajine avec boulettes de kefta',
    price: 18,
    cost: 7,
    nutritionalInfo: {
      calories: 520,
      proteins: 30,
      carbohydrates: 35,
      fats: 28,
      fiber: 5
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534939268631-4d2c0f0eef4e?w=500'
  },
  {
    name: 'Tajine de kefta',
    description: 'Tajine de kefta traditionnel',
    price: 13,
    cost: 5,
    nutritionalInfo: {
      calories: 450,
      proteins: 26,
      carbohydrates: 28,
      fats: 24,
      fiber: 4
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534939268631-4d2c0f0eef4e?w=500'
  },
  {
    name: 'Tajine boulette kefta (sardine)',
    description: 'Tajine avec boulettes de sardine',
    price: 15,
    cost: 6,
    nutritionalInfo: {
      calories: 480,
      proteins: 32,
      carbohydrates: 32,
      fats: 22,
      fiber: 5
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534939268631-4d2c0f0eef4e?w=500'
  },
  {
    name: 'Tajine de poulet (1/4) mdeghmer avec frites / légume',
    description: 'Quart de poulet en tajine doré avec frites ou légumes',
    price: 28,
    cost: 11,
    nutritionalInfo: {
      calories: 720,
      proteins: 42,
      carbohydrates: 45,
      fats: 38,
      fiber: 6
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534939268631-4d2c0f0eef4e?w=500'
  },
  {
    name: 'Tajine de poulet (1/8) mdeghmer avec frites / légume',
    description: 'Huitième de poulet en tajine doré avec frites ou légumes',
    price: 18,
    cost: 7,
    nutritionalInfo: {
      calories: 480,
      proteins: 28,
      carbohydrates: 38,
      fats: 24,
      fiber: 4
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534939268631-4d2c0f0eef4e?w=500'
  },
  {
    name: 'Emincer de poulet + salade',
    description: 'Émincé de poulet servi avec salade',
    price: 40,
    cost: 15,
    nutritionalInfo: {
      calories: 450,
      proteins: 48,
      carbohydrates: 20,
      fats: 20,
      fiber: 5
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500'
  },

  // Soups & Ramadan Specials
  {
    name: 'Harira',
    description: 'Soupe traditionnelle marocaine',
    price: 5,
    cost: 2,
    nutritionalInfo: {
      calories: 220,
      proteins: 12,
      carbohydrates: 35,
      fats: 4,
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
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500'
  },
  {
    name: '2 chabakia + oeuf',
    description: 'Deux chabakia avec œuf dur',
    price: 7,
    cost: 3,
    nutritionalInfo: {
      calories: 380,
      proteins: 10,
      carbohydrates: 55,
      fats: 14,
      fiber: 3
    },
    category: 'Dessert',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500'
  },
  {
    name: 'Bissara',
    description: 'Soupe de fèves traditionnelle',
    price: 6,
    cost: 2,
    nutritionalInfo: {
      calories: 180,
      proteins: 10,
      carbohydrates: 28,
      fats: 3,
      fiber: 7
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500'
  },
  {
    name: 'Lentille',
    description: 'Soupe de lentilles',
    price: 6,
    cost: 2,
    nutritionalInfo: {
      calories: 190,
      proteins: 12,
      carbohydrates: 30,
      fats: 2,
      fiber: 9
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500'
  },
  {
    name: 'Loubia',
    description: 'Haricots blancs en sauce',
    price: 6,
    cost: 2,
    nutritionalInfo: {
      calories: 210,
      proteins: 11,
      carbohydrates: 35,
      fats: 3,
      fiber: 10
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500'
  },

  // Side Dishes
  {
    name: 'Frites',
    description: 'Portion de frites',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 320,
      proteins: 4,
      carbohydrates: 42,
      fats: 15,
      fiber: 4
    },
    category: 'Side Dish',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'
  },

  // Breakfast Items
  {
    name: 'Msemen',
    description: 'Crêpe feuilletée marocaine',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 180,
      proteins: 5,
      carbohydrates: 28,
      fats: 6,
      fiber: 1
    },
    category: 'Snack',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1568606144219-f8e278c01ae4?w=500'
  },
  {
    name: 'Harcha',
    description: 'Galette de semoule',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 170,
      proteins: 4,
      carbohydrates: 30,
      fats: 5,
      fiber: 2
    },
    category: 'Snack',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1568606144219-f8e278c01ae4?w=500'
  },
  {
    name: 'Viennoiseries',
    description: 'Assortiment de viennoiseries',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 250,
      proteins: 5,
      carbohydrates: 35,
      fats: 10,
      fiber: 1
    },
    category: 'Snack',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'
  },
  {
    name: 'Crêpe',
    description: 'Crêpe sucrée',
    price: 6,
    cost: 2,
    nutritionalInfo: {
      calories: 220,
      proteins: 6,
      carbohydrates: 35,
      fats: 7,
      fiber: 1
    },
    category: 'Dessert',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500'
  },
  {
    name: 'Pancakes',
    description: 'Pancakes moelleux',
    price: 6,
    cost: 2,
    nutritionalInfo: {
      calories: 280,
      proteins: 8,
      carbohydrates: 42,
      fats: 9,
      fiber: 2
    },
    category: 'Dessert',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500'
  },
  {
    name: 'Omelette (2 oeuf)',
    description: 'Omelette avec deux œufs',
    price: 7,
    cost: 2,
    nutritionalInfo: {
      calories: 180,
      proteins: 14,
      carbohydrates: 2,
      fats: 13,
      fiber: 0
    },
    category: 'Main Course',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500'
  },

  // Desserts
  {
    name: 'Millefeuille',
    description: 'Pâtisserie millefeuille',
    price: 4,
    cost: 1.5,
    nutritionalInfo: {
      calories: 320,
      proteins: 4,
      carbohydrates: 42,
      fats: 16,
      fiber: 1
    },
    category: 'Dessert',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=500'
  },

  // Beverages
  {
    name: 'Café au lait',
    description: 'Café avec lait',
    price: 4,
    cost: 1.5,
    nutritionalInfo: {
      calories: 80,
      proteins: 4,
      carbohydrates: 8,
      fats: 3,
      fiber: 0
    },
    category: 'Beverage',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'
  },
  {
    name: 'Cappuccino',
    description: 'Cappuccino crémeux',
    price: 4,
    cost: 1.5,
    nutritionalInfo: {
      calories: 90,
      proteins: 5,
      carbohydrates: 10,
      fats: 4,
      fiber: 0
    },
    category: 'Beverage',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500'
  },
  {
    name: 'Café',
    description: 'Café noir',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 5,
      proteins: 0,
      carbohydrates: 1,
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
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'
  },
  {
    name: 'Thé (théière)',
    description: 'Théière de thé à la menthe',
    price: 5,
    cost: 1.5,
    nutritionalInfo: {
      calories: 30,
      proteins: 0,
      carbohydrates: 8,
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
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'
  },
  {
    name: 'Thé (une tasse)',
    description: 'Une tasse de thé',
    price: 1,
    cost: 0.5,
    nutritionalInfo: {
      calories: 8,
      proteins: 0,
      carbohydrates: 2,
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
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'
  },
  {
    name: 'Lait au chocolat',
    description: 'Lait chocolaté',
    price: 4,
    cost: 1.5,
    nutritionalInfo: {
      calories: 180,
      proteins: 8,
      carbohydrates: 26,
      fats: 5,
      fiber: 1
    },
    category: 'Beverage',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500'
  },
  {
    name: "Jus d'orange",
    description: 'Jus d\'orange frais',
    price: 5,
    cost: 2,
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
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'
  },
  {
    name: 'Jus de pomme',
    description: 'Jus de pomme frais',
    price: 6,
    cost: 2.5,
    nutritionalInfo: {
      calories: 115,
      proteins: 0,
      carbohydrates: 28,
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
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'
  },
  {
    name: "Jus d'avocat",
    description: 'Jus d\'avocat crémeux',
    price: 7,
    cost: 3,
    nutritionalInfo: {
      calories: 240,
      proteins: 3,
      carbohydrates: 22,
      fats: 18,
      fiber: 7
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
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'
  },
  {
    name: 'Panaché',
    description: 'Jus panaché aux fruits',
    price: 8,
    cost: 3,
    nutritionalInfo: {
      calories: 150,
      proteins: 2,
      carbohydrates: 36,
      fats: 0,
      fiber: 2
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
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'
  },
  {
    name: 'Raib',
    description: 'Lait fermenté traditionnel',
    price: 3,
    cost: 1,
    nutritionalInfo: {
      calories: 60,
      proteins: 3,
      carbohydrates: 5,
      fats: 3,
      fiber: 0
    },
    category: 'Beverage',
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isHalal: true
    },
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500'
  }
];

// Seed function
const seedMeals = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing meals
    console.log('Clearing existing meals...');
    await Meal.deleteMany({});

    // Insert new meals
    console.log('Inserting cafeteria meals...');
    const insertedMeals = await Meal.insertMany(cafeteriaMeals);

    console.log(`✓ Successfully inserted ${insertedMeals.length} meals`);
    console.log('\nMeal Categories Summary:');

    // Show summary by category
    const categories = {};
    insertedMeals.forEach(meal => {
      categories[meal.category] = (categories[meal.category] || 0) + 1;
    });

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} meals`);
    });

    console.log('\n✓ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding meals:', error);
    process.exit(1);
  }
};

// Run the seed
seedMeals();
