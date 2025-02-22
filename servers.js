const express = require('express');
const db= require('./db');
const Food = require('./models/foodModel');



const app = express();

// Middleware
app.use(express.json());
 

// Connect to MongoDB


// Example route
app.get('/', (req, res) => {
  res.send('Welcome to Food For Me API');
});

app.get('/api/food', async (req, res) => {
  const food = await Food.find();
  res.json(food);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
