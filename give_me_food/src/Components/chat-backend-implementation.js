// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const canteenRoutes = require('./routes/canteen');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/order');

// Controllers
const chatController = require('./controllers/chatController');

// Config
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Socket.io for real-time chat
io.on('connection', socket => {
  console.log('New client connected:', socket.id);

  // User joins a chat room
  socket.on('join_chat', ({ userId, ticketId }) => {
    socket.join(ticketId);
    console.log(`User ${userId} joined chat room ${ticketId}`);
  });

  // Admin joins a chat room
  socket.on('admin_join_chat', ({ adminId, ticketId }) => {
    socket.join(ticketId);
    console.log(`Admin ${adminId} joined chat room ${ticketId}`);
    
    // Notify user that admin has joined
    io.to(ticketId).emit('admin_joined', { adminId });
  });

  // Handle messages
  socket.on('send_message', async (messageData) => {
    try {
      // Save message to database
      const savedMessage = await chatController.saveMessage(messageData);
      
      // Broadcast message to room
      io.to(messageData.ticketId).emit('new_message', savedMessage);
      
      // If it's a user message with predefined options, trigger bot response
      if (messageData.sender === 'user' && messageData.requiresResponse) {
        const botResponse = await chatController.generateBotResponse(messageData);
        io.to(messageData.ticketId).emit('new_message', botResponse);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Admin actions (refund, resolve, escalate)
  socket.on('admin_action', async (actionData) => {
    try {
      const result = await chatController.processAdminAction(actionData);
      io.to(actionData.ticketId).emit('action_processed', result);
    } catch (error) {
      console.error('Error processing admin action:', error);
      socket.emit('error', { message: 'Failed to process action' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// File: models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  membershipStatus: {
    type: String,
    enum: ['Regular', 'Premium'],
    default: 'Regular'
  },
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    }
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  previousIssues: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

// File: models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  canteen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    customizations: {
      type: Object
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Wallet', 'Cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Partial Refund'],
    default: 'Pending'
  },
  deliveryAddress: {
    type: String
  },
  deliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique order number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const counter = await mongoose.model('Order').countDocuments() + 1;
    this.orderNumber = `FC-${year}-${counter.toString().padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

// File: models/ChatTicket.js
const mongoose = require('mongoose');

const ChatTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  issueType: {
    type: String,
    enum: ['Order Status', 'Food Issue', 'Refund', 'Delivery Problem', 'Payment Issue', 'Other'],
    required: true
  },
  subIssueType: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Resolved', 'Closed'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastResponseTime: {
    type: Date,
    default: Date.now
  },
  resolvedTime: {
    type: Date
  },
  resolution: {
    action: {
      type: String,
      enum: ['Refund', 'Replacement', 'Compensation', 'Information', 'None']
    },
    details: {
      type: String
    },
    amount: {
      type: Number
    }
  }
}, {
  timestamps: true
});

// Generate unique ticket number
ChatTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const counter = await mongoose.model('ChatTicket').countDocuments() + 1;
    this.ticketNumber = `TCKT-${year}-${counter.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('ChatTicket', ChatTicketSchema);

// File: models/ChatMessage.js
const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatTicket',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin', 'system', 'bot'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Admin']
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document']
    },
    url: {
      type: String
    },
    name: {
      type: String
    }
  }],
  options: [{
    text: String,
    value: String,
    action: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);

// File: controllers/chatController.js
const ChatTicket = require('../models/ChatTicket');
const ChatMessage = require('../models/ChatMessage');
const Order = require('../models/Order');
const User = require('../models/User');

// Chat support flow definitions
const supportFlows = {
  initial: [
    { text: 'Check Order Status', value: 'order_status', action: 'navigate' },
    { text: 'Report Food Issue', value: 'food_issue', action: 'navigate' },
    { text: 'Request Refund', value: 'refund', action: 'navigate' },
    { text: 'Delivery Problems', value: 'delivery', action: 'navigate' },
    { text: 'Payment Issues', value: 'payment', action: 'navigate' },
    { text: 'Other Questions', value: 'other', action: 'navigate' }
  ],
  refund: [
    { text: 'Food quality issue', value: 'quality', action: 'navigate' },
    { text: 'Wrong order received', value: 'wrong_order', action: 'navigate' },
    { text: 'Excessive delay', value: 'delay', action: 'navigate' },
    { text: 'Order never arrived', value: 'never_arrived', action: 'navigate' }
  ],
  refund_actions: [
    { text: 'Request full refund', value: 'full_refund', action: 'request' },
    { text: 'Request partial refund', value: 'partial_refund', action: 'request' },
    { text: 'Replace the order', value: 'replace', action: 'request' },
    { text: 'Speak to a support agent', value: 'agent', action: 'request' }
  ],
  // ... more flows for other issue types
};

// Bot response templates
const responseTemplates = {
  welcome: 'Hi there! I\'m your Food Canteen support assistant. How can I help you today?',
  refund_reason: 'I\'d be happy to help with your refund request. Could you please tell me the reason for the refund?',
  order_number_request: 'I\'m sorry to hear about the {issue}. Could you provide your order number so I can look into this for you?',
  order_found: 'Thank you for providing your order number. I can see this was an order for {items} from {canteen} placed about {time} ago.\n\nWould you like to:',
  photo_request: 'I understand you\'d like a {action}. Could you please upload a photo of the {issue} to help us improve our service?',
  // ... more templates
};

exports.createTicket = async (req, res) => {
  try {
    const { userId, orderId, issueType } = req.body;
    
    const newTicket = new ChatTicket({
      user: userId,
      order: orderId,
      issueType
    });
    
    const savedTicket = await newTicket.save();
    
    // Create initial welcome message
    const welcomeMessage = new ChatMessage({
      ticket: savedTicket._id,
      sender: 'bot',
      message: responseTemplates.welcome,
      options: supportFlows.initial
    });
    
    await welcomeMessage.save();
    
    // Update user's previous issues count
    await User.findByIdAndUpdate(userId, { $inc: { previousIssues: 1 } });
    
    res.status(201).json({
      success: true,
      data: {
        ticket: savedTicket,
        initialMessage: welcomeMessage
      }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

exports.getTicketMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const messages = await ChatMessage.find({ ticket: ticketId })
      .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

exports.saveMessage = async (messageData) => {
  try {
    const { ticketId, sender, senderId, message, options, attachments } = messageData;
    
    const newMessage = new ChatMessage({
      ticket: ticketId,
      sender,
      message,
      options,
      attachments
    });
    
    if (senderId) {
      newMessage.senderId = senderId;
      newMessage.senderModel = sender === 'user' ? 'User' : 'Admin';
    }
    
    // Update the last response time on the ticket
    await ChatTicket.findByIdAndUpdate(ticketId, {
      lastResponseTime: Date.now()
    });
    
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

exports.generateBotResponse = async (messageData) => {
  try {
    const { ticketId, message } = messageData;
    
    // Get the ticket and previous messages
    const ticket = await ChatTicket.findById(ticketId).populate('order user');
    const previousMessages = await ChatMessage.find({ ticket: ticketId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Determine context based on previous messages
    let context = 'initial';
    let responseTemplate = '';
    let options = [];
    
    // Simple bot logic based on the latest user message
    if (message.toLowerCase().includes('refund')) {
      context = 'refund';
      responseTemplate = responseTemplates.refund_reason;
      options = supportFlows.refund;
    } else if (supportFlows.refund.some(option => option.value === message.toLowerCase())) {
      context = 'order_request';
      responseTemplate = responseTemplates.order_number_request.replace('{issue}', message.toLowerCase());
      options = [];
    } else if (message.match(/^(order|#)?\s*FC-\d{4}-\d{5}$/i)) {
      // It's an order number
      const orderNumber = message.replace(/^(order|#)?\s*/i, '');
      const order = await Order.findOne({ orderNumber }).populate('canteen');
      
      if (order) {
        const itemNames = order.items.map(item => item.name).join(', ');
        const orderTime = Math.round((Date.now() - order.createdAt) / (1000 * 60));
        
        context = 'order_found';
        responseTemplate = responseTemplates.order_found
          .replace('{items}', itemNames)
          .replace('{canteen}', order.canteen.name)
          .replace('{time}', `${orderTime} minutes`);
        options = supportFlows.refund_actions;
      } else {
        responseTemplate = 'I couldn\'t find that order number. Could you please check and try again?';
      }
    } else if (supportFlows.refund_actions.some(option => option.value === message.toLowerCase())) {
      context = 'photo_request';
      const issue = previousMessages.find(msg => 
        supportFlows.refund.some(opt => opt.value === msg.message.toLowerCase())
      )?.message || 'issue';
      
      responseTemplate = responseTemplates.photo_request
        .replace('{action}', message.includes('full') ? 'full refund' : 
                          message.includes('partial') ? 'partial refund' : 'replacement')
        .replace('{issue}', issue);
      options = [];
    } else {
      // Default to admin handoff if we can't determine context
      responseTemplate = 'I\'m connecting you with a support agent who will help you further.';
      
      // Update ticket to show it needs admin attention
      await ChatTicket.findByIdAndUpdate(ticketId, {
        status: 'Pending',
        priority: 'Medium'
      });
    }
    
    // Create and save bot response
    const botResponse = new ChatMessage({
      ticket: ticketId,
      sender: 'bot',
      message: responseTemplate,
      options
    });
    
    const savedResponse = await botResponse.save();
    return savedResponse;
  } catch (error) {
    console.error('Error generating bot response:', error);
    throw error;
  }
};

exports.processAdminAction = async (actionData) => {
  try {
    const { ticketId, action, adminId, details } = actionData;
    
    const ticket = await ChatTicket.findById(ticketId).populate('order');
    
    switch (action) {
      case 'refund':
        // Process refund
        if (ticket.order) {
          await Order.findByIdAndUpdate(ticket.order._id, {
            status: 'Refunded',
            paymentStatus: 'Refunded'
          });
          
          ticket.resolution = {
            action: 'Refund',
            details: details || 'Full refund processed',
            amount: ticket.order.totalAmount
          };
        }
        break;
        
      case 'partial_refund':
        // Process partial refund
        if (ticket.order && details.amount) {
          await Order.findByIdAndUpdate(ticket.order._id, {
            paymentStatus: 'Partial Refund'
          });
          
          ticket.resolution = {
            action: 'Refund',
            details: details.reason || 'Partial refund processed',
            amount: parseFloat(details.amount)
          };
        }
        break;
        
      case 'resolve':
        // Mark ticket as resolved
        ticket.status = 'Resolved';
        ticket.resolvedTime = Date.now();
        break;
        
      case 'escalate':
        // Escalate ticket
        ticket.priority = 'High';
        ticket.assignedAdmin = adminId;
        break;
        
      default:
        return { success: false, message: 'Unknown action' };
    }
    
    // Update the ticket
    await ticket.save();
    
    // Create a system message about the action
    let actionMessage = '';
    switch (action) {
      case 'refund':
        actionMessage = 'Full refund has been processed for your order.';
        break;
      case 'partial_refund':
        actionMessage = `A partial refund of $${details.amount} has been processed for your order.`;
        break;
      case 'resolve':
        actionMessage = 'This support ticket has been marked as resolved.';
        break;
      case 'escalate':
        actionMessage = 'Your issue has been escalated to a senior support agent.';
        break;
    }
    
    const systemMessage = new ChatMessage({
      ticket: ticketId,
      sender: 'system',
      message: actionMessage
    });
    
    await systemMessage.save();
    
    return { 
      success: true, 
      ticket, 
      systemMessage,
      action
    };
  } catch (error) {
    console.error('Error processing admin action:', error);
    throw error;
  }
};

// File: routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// Create a new support ticket
router.post('/tickets', authMiddleware, chatController.createTicket);

// Get messages for a ticket
router.get('/tickets/:ticketId/messages', authMiddleware, chatController.getTicketMessages);

// Get all tickets for a user
router.get('/tickets/user/:userId', authMiddleware, async (req, res) => {
  try {
    const tickets = await require('../models/ChatTicket').find({ user: req.params.userId })
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
});

// Get all active tickets (for admin)
router.get('/tickets/status/:status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.params;
    
    const tickets = await require('../models/ChatTicket').find({ status })
      .populate('user order')
      .sort({ lastResponseTime: 1 });
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
});

// Admin assign self to ticket
router.put('/tickets/:ticketId/assign', authMiddleware, async (req, res) => {
  try {
    const { adminId } = req.body;
    
    const ticket = await require('../models/ChatTicket').findByIdAndUpdate(
      req.params.ticketId,
      { assignedAdmin: adminId },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
      error: error.message
    });
  }
});

module.exports = router;
