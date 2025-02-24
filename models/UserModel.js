const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "canteen_staff"], default: "user" }, // Role-based access
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "itemDetails" }, // ✅ Reference Food model
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
