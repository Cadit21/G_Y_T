import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/cartContext";
import data from "../Data/Food.js";
import img from "../images/front.png";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

function Foodlay() {
  const { addToCart } = useContext(CartContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddToCart = () => {
    addToCart(selectedItem, quantity);
    setAddedToCart(true);

    // Reset message after a short delay
    setTimeout(() => {
      setAddedToCart(false);
      setSelectedItem(null); // Close modal after adding
    }, 1500);
  };

  return (
    <div className="p-6">
      <img
        src={img}
        alt="Front"
        className="w-full object-cover rounded-lg shadow-md"
      />
      <h1 className="text-3xl font-bold mb-6 text-center">Food Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((item) => (
          <div
            key={item.name}
            className="bg-white p-4 shadow-lg rounded-2xl flex flex-col items-center transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            onClick={() => {
              setSelectedItem(item);
              setQuantity(1); // Reset quantity when selecting a new item
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <h2 className="text-xl font-semibold mt-3">{item.name}</h2>
            <p className="text-gray-600 text-lg">₹{item.price}</p>
          </div>
        ))}
      </div>

      {/* Modal for Product Details */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="bg-white p-6 rounded-lg shadow-2xl w-96 relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setSelectedItem(null)}
              >
                ✖
              </button>
              <motion.img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-48 h-48 object-cover mx-auto rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              />
              <h2 className="text-2xl font-bold mt-4 text-center">
                {selectedItem.name}
              </h2>
              <p className="text-gray-600 text-center text-lg">
                ₹{selectedItem.price}
              </p>
              <p className="text-gray-500 text-sm text-center mt-2">
                {selectedItem.description || "Delicious food for you!"}
              </p>

              {/* Quantity Selector */}
              <div className="mt-4 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Add to Cart
                </button>
              </div>

              {/* Added to Tray Notification */}
              {addedToCart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-4 text-green-600 font-semibold text-center"
                >
                  Added to Tray ✅
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Foodlay;
