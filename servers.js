const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const db= require('./db');
const dotenv = require('dotenv');
const Food = require('./models/foodModel');
const User = require('./models/UserModel');
const Order = require('./models/OrderModel');
const Razorpay = require("razorpay");
const crypto = require("crypto");

const cors = require('cors');


dotenv.config();
const app = express();
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware
app.get("/api/food", async (req, res) => {
  try {
      if (!mongoose.connection.readyState) {
          return res.status(500).json({ message: "Database not connected" });
      }
      const foodItems = await Food.find();
      res.json(foodItems);
  } catch (error) {
      console.error("Error fetching food items:", error);
      res.status(500).json({ message: "Server Error" });
  }
});


// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Food For Me API');
});



// Get food item by ID
app.get('/api/food/:id', async (req, res) => {
  const food = await Food.findById(req.params.id);
  res.json(food);
});

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error); // Add this to log errors
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/cart', async (req, res) => {
  const { userId, cart } = req.body;

  console.log("Received userId:", userId);
  console.log("Received cart data:", cart);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!Array.isArray(cart)) {
    return res.status(400).json({ message: "Invalid cart data" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found in database!");
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = cart;
    await user.save();

    console.log("Updated user cart:", user.cart);
    res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {   // ✅ Ensure this object is sent
        id: user._id,
        username: user.username,
        email: user.email,
        cart: user.cart || [],
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Create a Razorpay Order



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
