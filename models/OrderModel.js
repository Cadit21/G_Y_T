
const mongoose = require("mongoose");
const Food = require("./foodModel"); // Import the Food model
const User = require("./UserModel"); // Import the Order model


const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'itemDetails', required: true },
      foodName: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Completed", "Cancelled"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "UPI", "Razorpay"],
    required: true,
  },
  orderDate: { type: Date, default: Date.now },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
