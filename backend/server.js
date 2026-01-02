import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import timeSlotRoutes from './routes/timeSlotRoutes.js';
import wellnessRoutes from './routes/wellnessRoutes.js';
import externalMealRoutes from './routes/externalMealRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log(`📨 Full URL: ${req.url}`);
  console.log(`📨 Original URL: ${req.originalUrl}`);
  next();
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ENSIAS Eats API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
// API Routes
app.use('/api/auth', (req, res, next) => {
  console.log('🎯 Request hitting /api/auth:', req.method, req.path);
  next();
}, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/external-meals', externalMealRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
