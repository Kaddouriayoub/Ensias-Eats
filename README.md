# ENSIAS Eats – Smart Campus Dining Platform

**ENSIAS Eats** is a comprehensive Full-Stack solution designed to revolutionize the university dining experience. By integrating institutional authentication and a "Closed-Loop" digital payment system, the platform eliminates long queues, reduces student stress, and promotes healthy eating habits.

**Demo Video**: https://drive.google.com/drive/folders/12zVkXEablVJkMiBjpB9kfyWZ5IYxobDe?usp=sharing

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

---

## Tech Stack
* **Frontend**: React.js & MSAL React.
* **Backend**: Express.js (Node.js).
* **Database**: MongoDB & Mongoose.
* **Authentication**: Azure AD & JWT.
* **File Handling**: Multer for secure meal image uploads.

* ## Architecture

The project is divided into three main components:

1.  **Backend API**: Node.js/Express server with MongoDB.
2.  **Student Frontend**: React application for students to order meals and track nutrition.
3.  **Cafeteria Dashboard**: React application for staff and admins to manage operations.

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/kaddouriayoub/ensias-eats.git]
*   To run the ENSIAS Eats platform, you must initiate both the architectural layers simultaneously to enable real-time communication between the client-side interface and the server-side API. The Backend (Express.js) manages the database handshake with MongoDB and initializes the authentication services. Simultaneously, the Frontend (Vite + React) serves the premium "Glassmorphism" interface.

Follow these commands to launch the development environment:

### 1. Start the Backend API Open a terminal and run:
Bash


`` cd backend
    npm run dev ``

The server will initialize on http://localhost:3001 by default.

### 2. Start the Frontend Student Open a second terminal and run:
Bash

`` cd frontend
npm run dev ``

The interface will be accessible at http://localhost:5173
### 2. Start the Frontend Student Open a second terminal and run:
Bash

`` cd frontend-cafeteria
npm run dev ``

The interface will be accessible at http://localhost:5175
