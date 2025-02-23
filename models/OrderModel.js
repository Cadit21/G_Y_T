const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
  items: [
    {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
      name: String,
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Preparing", "Completed", "Cancelled"], default: "Pending" },
  orderDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ["Cash", "Card", "UPI"], required: true },
  
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
