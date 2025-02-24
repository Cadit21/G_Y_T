const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
        foodName: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true }, // Can also be a virtual field
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
  },
  { timestamps: true }
);

// Virtual field to calculate total price dynamically
orderSchema.virtual("calculatedTotalPrice").get(function () {
  return this.items.reduce((total, item) => total + item.quantity * item.price, 0);
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
