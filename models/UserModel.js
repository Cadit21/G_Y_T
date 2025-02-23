const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'canteen_staff'], default: 'user' }, // Role-based access
  cart: { type: Array, default: [] }, // Ensure cart is stored properly
});

module.exports = mongoose.model('User', UserSchema);

