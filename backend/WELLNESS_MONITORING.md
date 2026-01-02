# Wellness Tracking & Order Monitoring

## Overview
The system automatically tracks wellness data (calories, proteins, spending) when orders are completed or paid.

## Current Wellness Data
- **Daily Calories**: 4890 kcal
- **Daily Proteins**: 238g
- **Daily Spending**: 231 DH

---

## Automatic Wellness Tracking

### When Orders are Paid (Wallet Payment)
When a student pays for an order using their wallet, wellness tracking is **automatically updated immediately**:
- Location: `backend/controllers/orderController.js` (lines 175-199)
- Triggers: On wallet payment completion
- Updates: Daily & monthly calories, proteins, carbs, and spending

### When Order Status Changes
When cafeteria staff marks an order as "completed" or "paid":
- Location: `backend/controllers/orderController.js` (lines 428-467)
- Triggers: On status change to 'completed' or 'paid'
- Updates: Daily & monthly wellness data
- Prevents duplicates: Uses `wellnessProcessed` flag

---

## Background Monitoring Service

### What It Does
The monitoring service continuously checks for completed/paid orders that haven't been processed for wellness tracking and automatically processes them.

### How to Run

#### Option 1: Continuous Monitoring (Recommended for Production)
```bash
cd backend
npm run monitor
```

**Features:**
- Runs continuously in the background
- Checks every 30 seconds for unprocessed orders
- Automatically processes any found orders
- Safe to run alongside the main server
- Press Ctrl+C to stop

**Output Example:**
```
✅ Connected to MongoDB
🔍 Starting order monitoring service...

📊 Found 2 unprocessed orders - processing...
✅ Successfully processed: 2

⏰ Monitoring every 30 seconds for unprocessed orders...
```

#### Option 2: One-Time Processing
```bash
cd backend
npm run process-orders
```

**Features:**
- Processes all unprocessed orders once
- Useful for manual batch processing
- Exits after completion

---

## Dashboard Auto-Refresh

The student dashboard automatically refreshes every 30 seconds to pick up wellness data updates.

**Location:** `frontend/src/pages/student/Dashboard.jsx` (lines 39-50)

---

## Scripts Available

### 1. Start Main Server
```bash
npm start
```
Starts the API server on port 3001

### 2. Start Order Monitoring
```bash
npm run monitor
```
Starts the continuous monitoring service

### 3. Process Orders Once
```bash
npm run process-orders
```
Processes all unprocessed orders and exits

### 4. Development Mode
```bash
npm run dev
```
Starts server with auto-reload

---

## Production Deployment

### Run Both Services
In production, you should run both the main server and the monitoring service:

**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:**
```bash
cd backend
npm run monitor
```

### Using Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start main server
pm2 start npm --name "ensias-api" -- start

# Start monitoring service
pm2 start npm --name "order-monitor" -- run monitor

# View logs
pm2 logs

# Save configuration
pm2 save
pm2 startup
```

---

## How It Works

### 1. Order Created with Wallet Payment
```
User orders → Payment processed → Wellness tracking IMMEDIATELY updated
```

### 2. Order Marked as Completed/Paid by Staff
```
Staff marks order → Status changes → Wellness tracking updated
```

### 3. Background Monitoring (Backup)
```
Every 30 seconds → Check for unprocessed orders → Process them → Update wellness
```

### 4. Dashboard Display
```
Every 30 seconds → Fetch latest wellness data → Display updated stats
```

---

## Troubleshooting

### Dashboard Not Updating

**Check 1:** Is the backend server running?
```bash
lsof -i:3001
```

**Check 2:** Is the monitoring service running?
```bash
ps aux | grep monitorOrders
```

**Check 3:** Check backend logs
```bash
# Check for wellness data logs
tail -f backend/logs/* | grep "Wellness data"
```

### Orders Not Being Processed

**Solution:** Run the one-time processor:
```bash
cd backend
npm run process-orders
```

### Database Connection Issues

**Check:** MongoDB connection string in `.env`
```
MONGODB_URI=your_connection_string
```

---

## Database Schema

### WellnessTracking Collection
```javascript
{
  user: ObjectId,
  date: Date,
  day: Number,
  month: Number,
  year: Number,

  // Daily totals
  dailyCalories: Number,
  dailyProteins: Number,
  dailyCarbs: Number,
  dailySpent: Number,

  // Monthly totals
  monthlyCalories: Number,
  monthlyProteins: Number,
  monthlySpent: Number,

  // Order count
  ordersCompletedToday: Number
}
```

### Order Schema
```javascript
{
  student: ObjectId,
  items: Array,
  totalPrice: Number,
  totalCalories: Number,
  totalProteins: Number,
  totalCarbs: Number,
  status: String, // 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  paymentStatus: String, // 'pending', 'paid', 'refunded'
  wellnessProcessed: Boolean // Prevents duplicate counting
}
```

---

## API Endpoints

### Get Wellness Data
```http
GET /api/wellness/me?date=2026-01-02
Authorization: Bearer {token}
```

**Response:**
```json
{
  "dailyCalories": 4890,
  "dailyProteins": 238,
  "dailyCarbs": 423,
  "dailySpent": 231,
  "monthlyCalories": 4890,
  "monthlyProteins": 238,
  "monthlySpent": 231,
  "ordersCompletedToday": 10,
  "nutritionalGoal": "High Energy",
  "monthlyStats": {
    "totalCalories": 4890,
    "totalProteins": 238,
    "totalSpent": 231,
    "totalOrders": 10
  }
}
```

---

## Maintenance

### Reset Daily Data
Daily data is automatically reset at midnight by the WellnessTracking model.

### Manual Data Cleanup
```bash
cd backend
node scripts/cleanupWellnessData.js  # If you create this script
```

---

## Support

For issues or questions:
1. Check the logs: `pm2 logs` or console output
2. Verify MongoDB connection
3. Ensure both server and monitor are running
4. Check network connectivity between frontend and backend

---

Last Updated: 2026-01-02
