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
const canteen_staff = require('./models/CanteenstaafModel');

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
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ cart: user.cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
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

app.put("/api/cart", async (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure cart structure is correct
    user.cart = cart.map(item => ({
      productId: item.productId, // Ensure it's stored properly
      quantity: item.quantity,
      price: item.price, // Optional, but useful for tracking prices at the time of addition
    }));

    await user.save();
    res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});




app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("cart.productId"); // ✅ Populate Food details
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        cart: user.cart || [], // ✅ Ensure cart is always an array
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});






app.post("/api/register-canteen", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let staff = await canteen_staff.findOne({ email });
    if (staff) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    staff = new canteen_staff({ username, email, password: hashedPassword });
    await staff.save();

    res.status(201).json({ message: "Canteen staff registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "username email").populate("items.productId", "name price");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/orders/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId", "name price")
      .sort({ orderDate: -1 }); // Latest orders first

    if (!orders.length) return res.status(404).json({ message: "No orders found" });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/orders/status/:status", async (req, res) => {
  try {
    const validStatuses = ["Pending", "Preparing", "Completed", "Cancelled"];
    const status = req.params.status;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const orders = await Order.find({ status }).populate("userId", "username").populate("items.productId", "name price");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0 || !paymentMethod) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Fetch food details to validate items and calculate total price
    const foodItems = await Food.find({ _id: { $in: items.map(item => item.foodId) } });

    if (!foodItems || foodItems.length !== items.length) {
      return res.status(400).json({ message: "Some food items are invalid" });
    }

    // Calculate total price
    let totalPrice = 0;
    const validatedItems = items.map(item => {
      const food = foodItems.find(f => f._id.toString() === item.foodId);
      totalPrice += food.price * item.quantity;

      return {
        foodId: food._id,
        name: food.name,
        quantity: item.quantity,
        price: food.price
      };
    });

    // Create new order
    const newOrder = new Order({
      userId,
      items: validatedItems,
      totalPrice,
      paymentMethod,
      status: "Pending"
    });

    // Save order to database
    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/food", async (req, res) => {
  try {
    const { name, price, category, type, image ,stock } = req.body;

    if (!name || !price || !category || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProduct = new Food({ name, price, category, type, image,stock });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});


// ✅ **3. Update a Product**
app.put("/api/food/:id", async (req, res) => {
  try {
    const { name, price, category, type, image,stock } = req.body;

    const updatedProduct = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: { name, price, category, type, image ,stock } }, // Only update the provided fields
      { new: true, runValidators: true } // Ensure validation is applied
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});


// ✅ **4. Delete a Product**
app.delete("/api/food/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const deletedProduct = await Food.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});


// Get order history (completed orders)
app.get("api/history", async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ["Completed", "Cancelled"] } }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/bestselling", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Completed" });

    const itemSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            category: item.category || "Uncategorized",
            totalSold: 0,
            revenue: 0,
          };
        }
        itemSales[item.name].totalSold += item.quantity;
        itemSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const bestSellingItems = Object.values(itemSales).sort(
      (a, b) => b.totalSold - a.totalSold
    );

    res.json(bestSellingItems);
  } catch (error) {
    console.error("Error fetching best-selling items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});








// Create a Razorpay Order



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
