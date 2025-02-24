const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default:100
        
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Food = mongoose.model('itemDetails', foodSchema);


module.exports = Food;
