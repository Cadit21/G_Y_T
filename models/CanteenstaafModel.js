const mongoose = require('mongoose');

const CanteenStaffSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "canteen_staff" },  // Fixed role
});

module.exports = mongoose.model('CanteenStaff', CanteenStaffSchema);
