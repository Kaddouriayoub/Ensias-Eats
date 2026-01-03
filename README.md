# ENSIAS Eats – Smart Campus Dining Platform

**ENSIAS Eats** is a comprehensive Full-Stack solution designed to revolutionize the university dining experience. By integrating institutional authentication and a "Closed-Loop" digital payment system, the platform eliminates long queues, reduces student stress, and promotes healthy eating habits.

---

## Key Technical Pillars

### 1. Enterprise-Grade Authentication & Security
* **University Integration**: Seamless sign-in using **Microsoft Azure Active Directory (MSAL)**, ensuring only verified students with `@um5.ac.ma` credentials can access the platform.
* **Hybrid Security Architecture**: Combines MSAL for students with **JWT (JSON Web Tokens)** for staff and administrative session management.
* **Role-Based Access Control (RBAC)**: Custom middleware ensures strict access boundaries for `student`, `cafeteria_staff`, and `admin` roles.

### 2. Financial Integrity & Wallet System
* **Atomic Transactions**: Financial operations utilize **MongoDB atomic updates** to prevent race conditions and ensure 100% balance accuracy.
* **Closed-Loop Economy**: A dedicated digital wallet allows students to manage their monthly budget and pay instantly without external gateways.
* **Multi-Channel Recharge**: Supports both staff-assisted cash recharges and a self-service **QR-based** request system.

### 3. Nutrition & Operational Intelligence
* **Data-Driven Dining**: A robust CMS allows admins to track **macronutrients** (Calories, Proteins, Carbs) and dietary tags (Vegan, Gluten-Free) for every meal.
* **Real-Time Kitchen Management**: The staff dashboard features an **Auto-Refresh System (10s polling)**, ensuring the kitchen display is always synchronized with incoming orders.
* **Business Analytics**: Built-in profit tracking that calculates cost vs. price margins to optimize cafeteria operations.

---

## Premium UI/UX Experience
* **Glassmorphism Theme**: A modern dark-mode interface featuring backdrop blurs and smooth transitions for a premium "Silicon Valley" feel.
* **Smart Cart**: Instant checkout experience integrated directly with the student's digital wallet.
* **Order Tracking**: Real-time visual indicators that guide the student from "Order Placed" to "Ready for Pickup".
* **QR Verification**: Secure and fast order fulfillment via QR code scanning at the pickup counter.

---

## 🛠 Tech Stack
* **Frontend**: React.js & MSAL React.
* **Backend**: Express.js (Node.js).
* **Database**: MongoDB & Mongoose.
* **Authentication**: Azure AD & JWT.
* **File Handling**: Multer for secure meal image uploads.

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-repo/ensias-eats.git](https://github.com/your-repo/ensias-eats.git)
