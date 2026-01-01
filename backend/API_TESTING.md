# ENSIAS Eats API Testing Guide

## 🚀 Server Info

```
Base URL: http://localhost:3001
Status: ✅ Running
Database: ✅ Connected to MongoDB Atlas
```

## 🧪 Quick Tests

### 1. Server Health

```bash
curl http://localhost:3001/health
```

### 2. Get All Meals

```bash
curl http://localhost:3001/api/meals | python3 -m json.tool
```

### 3. Get Meal Categories

```bash
curl http://localhost:3001/api/meals/categories | python3 -m json.tool
```

### 4. Get Available Time Slots

```bash
curl http://localhost:3001/api/timeslots | python3 -m json.tool
```

## 🔐 Authentication Testing

### Get Microsoft OAuth URL

```bash
curl http://localhost:3001/api/auth/microsoft/login
```

**Note**: This will return an error until Azure AD credentials are configured.

## 📝 Test Data Available

### Users

```
Student:
  Email: ayoub.elalaoui@um5.ac.ma
  Password: password123
  Wallet Balance: 200 DHS
  Monthly Budget: 500 DHS

Cafeteria Staff:
  Email: fatima.zahra@um5.ac.ma
  Password: password123

Admin:
  Email: admin@um5.ac.ma
  Password: password123
```

### Meals (8 total)

- Couscous Royal (25 DHS, 650 cal)
- Tagine Poulet (30 DHS, 580 cal)
- Salade Méditerranéenne (20 DHS, 320 cal)
- Soupe Harira (12 DHS, 280 cal)
- Sandwich Poulet (18 DHS, 450 cal)
- Jus Orange Frais (8 DHS, 110 cal)
- Yaourt Nature (5 DHS, 80 cal)
- Pastilla Poulet (35 DHS, 720 cal)

### Time Slots (25 total)

- 12:00 - 12:30 (30 orders max)
- 12:30 - 13:00 (40 orders max)
- 13:00 - 13:30 (40 orders max)
- 13:30 - 14:00 (30 orders max)
- 14:00 - 14:30 (20 orders max)

Available: Monday to Friday

## 🧪 Advanced Testing (Requires Authentication)

After implementing authentication, you can test these endpoints:

### Get User Profile

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/users/profile | python3 -m json.tool
```

### Get Personalized Meal Recommendations

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/meals/recommendations/for-me | python3 -m json.tool
```

### Get User Dashboard

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/users/dashboard | python3 -m json.tool
```

### Get Wallet Balance

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/wallet/balance | python3 -m json.tool
```

### Create Order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "mealId": "MEAL_ID_HERE",
        "quantity": 1
      }
    ],
    "pickupTimeSlot": "2026-01-02T12:00:00Z",
    "timeSlotId": "TIMESLOT_ID_HERE",
    "paymentMethod": "wallet"
  }' | python3 -m json.tool
```

## 🔧 Troubleshooting

### Server not responding

```bash
# Check if server is running
lsof -i :3001

# Restart server
npm run dev
```

### Database connection issues

```bash
# Check MongoDB connection string in .env
cat .env | grep MONGODB_URI

# Re-seed database
npm run seed
```

### Authentication errors

1. Check Azure AD configuration in .env
2. Verify redirect URI matches Azure AD settings
3. Ensure UM5 email domain validation is correct

## 📊 Postman Collection

Import this collection for easy API testing:

```json
{
  "info": {
    "name": "ENSIAS Eats API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Meals",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/meals",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "meals"]
        }
      }
    },
    {
      "name": "Get Meal Categories",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/meals/categories",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "meals", "categories"]
        }
      }
    },
    {
      "name": "Get Time Slots",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/timeslots",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "timeslots"]
        }
      }
    }
  ]
}
```

## ✅ Success Indicators

- [ ] Server starts on port 3001
- [ ] MongoDB connects successfully
- [ ] GET /api/meals returns 8 meals
- [ ] GET /api/meals/categories returns 5 categories
- [ ] GET /api/timeslots returns 25 time slots
- [ ] GET /health returns status "ok"
