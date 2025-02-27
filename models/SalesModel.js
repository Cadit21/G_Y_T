const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to Order collection
    required: true
  },
  totalSales: {
    type: Number,
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sales', SalesSchema);
