# Grab-Your-Tray

## Overview

Grab-Your-Tray is a web application designed to streamline food ordering and management for users, canteen staff, and administrators respectively.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT, Bcrypt
- **Other Tools:** Vercel, Socket.io

## Deployment
- **Frontend:** Hosted on Vercel 
- **Backend:** Deployed on 

## Project Structure

```
G_Y_T/
├── client/                 # Frontend source code
├── server/                 # Backend source code
├── models/                 # Database models
├── node_modules/           # Node.js modules
├── .env                    # Environment variables
├── db.js                   # Database connection setup
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Dependency tree lockfile
└── server.js               # Entry point for the backend server
```

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later) or yarn


### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Cadit21/G_Y_T.git
   cd G_Y_T
   ```

2. **Install backend dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**

   - Create a `.env` file in the root directory with the following content:
     ```
     DB_CONNECTION=[your_database_connection_string]
     PORT=5000
     [Other environment variables]
     ```
   - Replace `[your_database_connection_string]` and `[Other environment variables]` with actual values.

4. **Start the backend server:**

   ```sh
   npm start
   ```

   The server should now be running on `http://localhost:5000/`.

5. **Navigate to the frontend directory and install dependencies:**

   ```sh
   cd client
   npm install
   ```

6. **Start the frontend development server:**

   ```sh
   npm start
   ```

   The frontend should now be running on `http://localhost:3000/`.

## Features

### For Users
- Attractive design for better user experience
- User authentication with username and email login
- Add to tray option for food selection
- Mobile responsive interface
- Order tracking with order ID, status, and item details
- Buy selected, buy all, and delete options in the tray
- Search functionality for food items
- Login/register prompt when adding to tray if not logged in
- Hovering over food items displays descriptions
- Smooth UI for scrolling through items
- Customer support section with history of resolved issues
- Display of best-selling food items
- Out-of-stock indicator for unavailable food items
- Password hashing for authentication

### For Canteen Staff
- View order details
- Manage product details
- Add, update, and remove food items
- View order history
- Track best-selling items
- Chat support for user communication
- Minimalistic yet functional UI for efficiency
- Canteen staff login system

### For Admin
- Daily sales reports with data visualization
- View user IDs and their order history
- Admin login system
- Track best-selling items

## Environment Variables

The application requires the following environment variables:

- `DB_CONNECTION`: Database connection string
- `PORT`: Port number for the backend server
- [Other variables as needed]

Ensure these are set in your `.env` file before running the application.



## Contributing

1. **Fork the repository**
2. **Create a new branch:**
   ```sh
   git checkout -b feature/YourFeatureName
   ```
3. **Commit your changes:**
   ```sh
   git commit -m 'Add some feature'
   ```
4. **Push to the branch:**
   ```sh
   git push origin feature/YourFeatureName
   ```
5. **Open a pull request**


## Contact
For any inquiries or issues, please contact:
- **GitHub Contributors:**  
  - [Cadit21](https://github.com/Cadit21)  
  - [OMKAR-COD636](https://github.com/OMKAR-COD636)  
  - [Shreshtha-Kumar](https://github.com/Shreshtha-Kumar)
  - [Yashasvii-29](https://github.com/Yashasvii-29)
- **Email:** [vikramaerospace111@gmail.com](mailto:vikramaerospace111@gmail.com)

