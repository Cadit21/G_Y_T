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
const { appendFileSync } = require('fs');


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
    const cart = await User.findOne({ _id: req.params.userId }).populate("cart.productId");


    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ cart: cart.cart }); // Send populated cart array
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/cart/:userId", async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Get productId and quantity from request
    const user = await User.findOne({ _id: req.params.userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product already exists in the cart
    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if (existingItem) {
      // If exists, update the quantity
      existingItem.quantity += quantity;
    } else {
      // If not, add a new item to the cart
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.delete("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Ensure userId and productId are in ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid user ID or product ID format" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the item from the cart
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated user document
    await user.save();

    res.json({ message: "Item removed successfully", cart: user.cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add or update cart item
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validate userId and productId...

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the product is already in the cart
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      user.cart.push({ productId, quantity });
    }

    // Save the updated user
    await user.save();

    res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
  try {
    const { userId, cart } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedCart = [...user.cart];

    cart.forEach((newItem) => {
      const existingItem = updatedCart.find(
        (cartItem) => cartItem.productId.toString() === newItem.productId.toString()
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        updatedCart.push(newItem);
      }
    });

    user.cart = updatedCart;
    await user.save();

    res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



app.delete("/api/cart/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Ensure userId and productId are in ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the item from the cart
    user.cart = user.cart.filter(
      (cartItem) => cartItem.productId.toString() !== productId.toString()
    );

    // Save the updated user document
    await user.save();

    res.json({ message: "Item removed successfully", cart: user.cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    const orders = await Order.find()
      .populate("userId", "username") // ✅ Get username
      .populate("items.productId", "name"); // ✅ Get product details

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/api/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Find and update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return updated order
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

    console.log("Received Items:", items); // Debugging line ✅

    // Convert `productId` to ObjectId
    const foodItems = await Food.find({
      _id: { $in: items.map(item => new mongoose.Types.ObjectId(item.productId)) }
    });

    if (!foodItems || foodItems.length !== items.length) {
      return res.status(400).json({ message: "Some food items are invalid" });
    }

    let totalPrice = 0;
    const validatedItems = [];
    for (let item of items) {
      const food = foodItems.find(f => f._id.toString() === item.productId);
      if (!food) {
        return res.status(400).json({ message: `Food item ${item.productId} not found` });
      }
      if (food.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${food.name}` });
      }

      totalPrice += food.price * item.quantity;
      validatedItems.push({
        productId: food._id, // ✅ Fixed Key
        name: food.name,
        quantity: item.quantity,
        price: food.price
      });

      // Update stock
      food.stock -= item.quantity;
      await food.save();
    }

    // Create order
    const newOrder = new Order({
      userId,
      items: validatedItems,
      totalPrice,
      paymentMethod,
      status: "Pending",
      orderDate: new Date()
    });

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

app.post("/api/login-canteen", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await canteen_staff.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Ensure role is "canteen_staff"
    if (user.role !== "canteen_staff") {
      return res.status(403).json({ message: "Access denied! Not a canteen owner." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, role: user.role, message: "Login successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
});







// Create a Razorpay Order



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
