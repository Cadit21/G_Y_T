const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/food_for_me')
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Connection error:', err));

module.exports = mongoose;
