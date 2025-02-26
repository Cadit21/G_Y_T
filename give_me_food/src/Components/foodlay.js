import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/cartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HomePage from "./homepage";

function Foodlay() {
  const { addToCart } = useContext(CartContext);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [filter, setFilter] = useState("All");
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food");
      const data = await response.json();
      setFoodItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setFoodItems([]);
    }
  };

  const handleFilterChange = (category) => {
    setFilter(category);
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add items to the cart.");
      navigate("/login");
      return;
    }
    addToCart(selectedItem, quantity);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setSelectedItem(null);
    }, 1500);
  };

  const filteredData = foodItems.filter(
    (item) =>
      filter === "All"
        ? true
        : ["veg", "non-veg"].includes(filter)
        ? item.type === filter
        : item.category === filter
  );

  return (
    <>
      <HomePage />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {["All", "veg", "non-veg", "Snack", "Lunch", "Combo"].map((category) => (
            <span
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`px-5 py-2 rounded-full cursor-pointer text-sm font-semibold transition shadow-md 
                ${filter === category ? "bg-orange-500 text-orange-300" : "bg-white-700 text-orange-500 hover:bg-orange-400 hover:text-white"}`}
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {foodItems.map((item) => (
            <div
              key={item._id}
              className="relative bg-gray-100 p-5 shadow-xl rounded-2xl flex flex-col items-center transition duration-300 hover:scale-105 hover:shadow-2xl border-2 border-orange-400 cursor-pointer"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-36 h-36 object-cover rounded-lg border-2 border-gray-300"
              />
              <h2 className="text-lg font-bold mt-3 text-gray-900">{item.name}</h2>
              <p className="text-orange-500 text-lg font-semibold">₹{item.price}</p>
              
              <AnimatePresence>
                {hoveredItem?._id === item._id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-[-100%] left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-300 w-64"
                  >
                    <img
                      src={hoveredItem.image}
                      alt={hoveredItem.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{hoveredItem.name}</h3>
                    <p className="text-sm text-gray-600">{hoveredItem.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -50 }}
                className="bg-white p-6 rounded-lg shadow-2xl w-96 relative border-2 border-orange-400"
              >
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setSelectedItem(null)}>
                  ✖
                </button>
                <motion.img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-48 h-48 object-cover mx-auto rounded-lg border-2 border-gray-300"
                />
                <h2 className="text-2xl font-bold mt-4 text-center text-gray-900">{selectedItem.name}</h2>
                <p className="text-orange-500 text-center text-lg font-semibold">₹{selectedItem.price}</p>
                <p className="text-gray-600 text-sm text-center mt-2">{selectedItem.description}</p>
                <div className="mt-4 flex justify-center items-center space-x-4">
                  <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg">-</button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity((prev) => prev + 1)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg">+</button>
                </div>
                <div className="mt-4 flex justify-center">
                  <button onClick={handleAddToCart} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">Add to Cart</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Foodlay;
