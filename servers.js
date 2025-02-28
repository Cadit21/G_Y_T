const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./db");
const Food = require("./models/foodModel");
const User = require("./models/UserModel");
const Order = require("./models/OrderModel");
const ChatMessage = require("./models/ChatMessage");
const CanteenStaff = require("./models/CanteenStaafModel");
const Admin = require("./models/AdminModel");
const Sales = require("./models/SalesModel");

dotenv.config();
const app = express();

// 🔧 CORS Configuration (Dynamic)
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🖥️ Create HTTP Server
const server = http.createServer(app);

// 🔌 Setup Socket.io
const io = new Server(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true },
});

// 🌍 Store Connected Users
const connectedUsers = {}; // { userId: socketId }

// 🔗 Handle WebSocket Connection
io.on("connection", (socket) => {
  console.log(`✅ New connection: ${socket.id}`);

  // User Registration (Store socket ID)
  socket.on("register", (userId) => {
    if (userId) {
      connectedUsers[userId] = socket.id;
      console.log(`👤 User Registered: ${userId} -> ${socket.id}`);
    }
  });

  // Handle Incoming Messages
  socket.on("chatMessage", async (message) => {
    console.log("📩 Message received:", message);

    try {
      const newMessage = new ChatMessage(message);
      await newMessage.save();

      const receiverSocketId = connectedUsers[message.receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("chatMessage", message);
      } else {
        console.log(`⚠️ Receiver ${message.receiverId} is offline. Message saved.`);
      }
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    const userId = Object.keys(connectedUsers).find((id) => connectedUsers[id] === socket.id);
    if (userId) delete connectedUsers[userId];

    console.log(`❌ Disconnected: ${socket.id}`);
  });
});

app.get("/query/:queryId", async (req, res) => {
  try {
    const { queryId } = req.params;
    const messages = await ChatMessage.find({ queryId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.put("/query/resolve/:queryId", async (req, res) => {
  try {
    const { queryId } = req.params;

    const updatedMessage = await ChatMessage.updateMany(
      { queryId },
      { $set: { resolved: true } }
    );

    if (updatedMessage.modifiedCount > 0) {
      return res.status(200).json({ message: "Query marked as resolved" });
    } else {
      return res.status(404).json({ error: "Query not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating query" });
  }
});


app.get("/api/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching messages for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Fetch all messages where the user is either the sender or receiver
    const messages = await ChatMessage.find({
      $or: [{ receiverId: userId }, { senderId: userId }]
    })
      .sort({ createdAt: 1 })
      .lean();

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    // Group messages by queryId for structured conversations
    const groupedMessages = messages.reduce((acc, message) => {
      if (!acc[message.queryId]) {
        acc[message.queryId] = { queryId: message.queryId, resolved: message.resolved, messages: [] };
      }
      acc[message.queryId].messages.push(message);
      return acc;
    }, {});

    console.log("Fetched messages:", Object.values(groupedMessages));
    res.json(Object.values(groupedMessages));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/query/resolve/:queryId", async (req, res) => {
  try {
    const { queryId } = req.params;

    const updatedMessage = await ChatMessage.updateMany(
      { queryId },
      { $set: { resolved: true } }
    );

    if (updatedMessage.modifiedCount > 0) {
      return res.status(200).json({ message: "Query marked as resolved" });
    } else {
      return res.status(404).json({ error: "Query not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating query" });
  }
});


app.post("/api/generate-query-id", async (req, res) => {
  console.log("Received request body:", req.body);  // 🔍 Debugging

  const { senderId, senderName, type, content } = req.body;

  try {
    if (!senderId || !senderName || !type || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let existingQuery = await ChatMessage.findOne({ senderId, type, resolved: false });

    if (existingQuery) {
      return res.json({ queryId: existingQuery.queryId });
    }

    let queryId = `query_${Math.random().toString(36).substr(2, 9)}`;

    const newMessage = new ChatMessage({
      senderId,
      senderName,
      receiverId: null,
      content,
      type,   // Ensure `type` is correctly passed
      queryId,
      resolved: false,
    });

    await newMessage.save();
    res.json({ queryId });

  } catch (error) {
    console.error("Error generating query ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/resolved-queries/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      const resolvedQueries = await ChatMessage.find({ senderId: userId, resolved: true });

      if (!resolvedQueries) {
          return res.status(404).json({ message: "No resolved queries found" });
      }

      res.json(resolvedQueries);
  } catch (error) {
      console.error("Error fetching resolved queries:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});


// 📌 Send a Message
app.post("/send-message", async (req, res) => {
  const { senderId, senderName, content, type, receiverId, queryId } = req.body;

  try {
    if (!queryId) {
      return res.status(400).json({ error: "Query ID is required" });
    }

    // Step 1: Check if the query exists
    const existingQuery = await ChatMessage.findOne({ queryId });

    if (!existingQuery) {
      return res.status(404).json({ error: "Query not found" });
    }

    // Step 2: Create and save a new message document
    const newMessage = new ChatMessage({
      queryId,
      senderId,
      senderName,
      receiverId,
      content,
      type,
      timestamp: new Date(),
    });

    await newMessage.save();

    // Step 3: Emit the message to the receiver if online
    const receiverSocketId = connectedUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatMessage", newMessage);
    }

    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// 📜 Fetch Canteen Staff ID
app.get("/canteen-staff", async (req, res) => {
  try {
    const canteenStaff = await CanteenStaff.findOne({ role: "canteen_staff" });
    if (!canteenStaff) {
      return res.status(404).json({ error: "Canteen staff not found" });
    }
    res.json({ staffId: canteenStaff._id });
  } catch (error) {
    console.error("Error fetching canteen staff:", error);
    res.status(500).json({ error: "Error fetching canteen staff" });
  }
});

// 📜 Fetch Admin ID
app.get("/admin", async (req, res) => {
  try {
    const admin = await Admin.findOne({ role: "admin" });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ adminId: admin._id });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ error: "Error fetching admin" });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Food For Me API');
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
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

app.get("/api/sales/total", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    res.json({ totalSales: totalSales[0]?.totalRevenue || 0 });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/sales/payment-method", async (req, res) => {
  try {
    const salesByPayment = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: "$paymentMethod", totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    res.json(salesByPayment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/sales/food-item", async (req, res) => {
  try {
    const salesByFood = await Order.aggregate([
      { $match: { status: "Completed" } }, // Only count completed orders
      { $unwind: "$items" }, // Break array into individual items
      { 
        $lookup: {
          from: "itemdetails", // Ensure this matches your MongoDB collection name
          localField: "items.productId",
          foreignField: "_id",
          as: "foodDetails"
        }
      },
      { $unwind: "$foodDetails" }, // Get single object instead of array
      { 
        $group: {
          _id: "$foodDetails.name",
          totalSold: { $sum: "$items.quantity" }, // Total quantity sold
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } // Total revenue
        }
      },
      { $sort: { revenue: -1 } } // Sort by revenue (highest first)
    ]);

    res.json(salesByFood);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/sales/daily", async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }, totalRevenue: { $sum: "$totalPrice" } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }, // Convert array to object
      {
        $lookup: {
          from: "itemdetails", // ✅ Correct collection name
          localField: "items.productId",
          foreignField: "_id",
          as: "foodDetails"
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                productId: "$$item.productId",
                name: {
                  $arrayElemAt: [
                    "$foodDetails.name",
                    { $indexOfArray: ["$foodDetails._id", "$$item.productId"] }
                  ]
                },
                quantity: "$$item.quantity",
                price: {
                  $arrayElemAt: [
                    "$foodDetails.price",
                    { $indexOfArray: ["$foodDetails._id", "$$item.productId"] }
                  ]
                } // ✅ Correctly fetching price
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          username: "$userDetails.username",
          items: 1,
          totalPrice: 1,
          status: 1,
          paymentMethod: 1,
          orderDate: 1
        }
      }
    ]);

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
        id: user._id, // ⛔️ Should be _id (not id)
        username: user.username,
        email: user.email,
        role: user.role,
        cart: user.cart || [], 
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
    let staff = await CanteenStaff.findOne({ email });
    if (staff) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    staff = new CanteenStaff({ username, email, password: hashedPassword });
    await staff.save();

    res.status(201).json({ message: "Canteen staff registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});





app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId", "name price")
      .exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
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

app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("items.productId");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/food", async (req, res) => {
  try {
    const foodItems = await Food.find(); // If using MongoDB/Mongoose
    res.json(foodItems);
  } catch (error) {
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
    const { _id, timestamp, __v, ...updateData } = req.body; // Exclude fields that should not be updated

    console.log("Product ID:", req.params.id);
    console.log("Filtered Update Data:", updateData);

    const updatedProduct = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Only update valid fields
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: error.message });
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
    const bestSellingItem = await Order.aggregate([
      { $match: { status: "Completed" } }, // Only completed orders
      { $unwind: "$items" }, // Break items array into separate docs
      {
        $lookup: {
          from: "itemdetails", // Ensure correct collection name
          localField: "items.productId",
          foreignField: "_id",
          as: "foodDetails"
        }
      },
      { $unwind: "$foodDetails" }, // Convert array to object
      {
        $group: {
          _id: "$foodDetails._id",
          name: { $first: "$foodDetails.name" },
          category: { $first: "$foodDetails.category" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } }, // Sort by highest sales
      { $limit: 1 } // Get the top-selling item
    ]);

    if (bestSellingItem.length === 0) {
      return res.json({ message: "No sales data found" });
    }

    res.json(bestSellingItem);
  } catch (error) {
    console.error("Error fetching best-selling item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/api/login-canteen", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await CanteenStaff.findOne({ email });

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

    res.json({ 
      token, 
      role: user.role, 
      message: "Login successful!", 
      _id: user._id // ✅ Correct way to send _id
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
});

app.post("/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ error: "Admin already exists" });

    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    res.status(201).json({ message: "Admin created" });
  } catch (error) {
    res.status(500).json({ error: "Error registering admin" });
  }
});



// Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: admin._id }, "secretKey", { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});



// Route to fetch all sales (based on orders)
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Order.find()
      .select('totalPrice orderDate') // Only select the necessary fields: totalPrice and orderDate
      .sort({ orderDate: -1 }); // Sort by the latest order first

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch sales by date range (based on orders)
app.get('/api/sales/date', async (req, res) => {
  const { startDate } = req.query;

  try {
    if (!startDate ) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const sales = await Order.find({
      orderDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    })
      .select('totalPrice orderDate')
      .sort({ orderDate: -1 });

    console.log(sales);

    res.json(sales);
  
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/api/canteen_staff/:id", async (req, res) => {
  try {
    const staff = await CanteenStaff.findById(req.params.id).select("-password");
    if (!staff) return res.status(404).json({ message: "Canteen staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/api/admins/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});






// Create a Razorpay Order



// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

