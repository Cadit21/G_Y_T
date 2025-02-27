import React, { useEffect, useRef, useState, useContext } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { CartContext } from "../context/cartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

gsap.registerPlugin(Draggable);

const CardSlider = ({ searchQuery = "" }) => {
  const { addToCart } = useContext(CartContext);
  const [foodItems, setFoodItems] = useState([]);
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const spacing = 250;

  // Fetch Food Items
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

  // Fetch Best Selling Items
  const fetchBestSellingItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      const completedOrders = res.data.filter(order => order.status === "Completed");
      const productSales = {};

      completedOrders.forEach(order => {
        if (!order.items) return;
        order.items.forEach(item => {
          const foodName = item.foodName;
          if (foodName) {
            if (!productSales[foodName]) {
              productSales[foodName] = { name: foodName, quantity: 0, revenue: 0 };
            }
            productSales[foodName].quantity += item.quantity || 0;
            productSales[foodName].revenue += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      const sortedProductSales = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 2);

      setBestSellingItems(sortedProductSales);
    } catch (error) {
      console.error("Error fetching best-selling items:", error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
    fetchBestSellingItems();
  }, []);

  const filteredItems = searchQuery.trim()
    ? foodItems.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : foodItems;

  const scrollToCard = (index) => {
    setCurrentIndex(index);
    gsap.to(cardsRef.current, {
      x: -index * spacing + (filteredItems.length * spacing) / 2 - spacing / 2,
      duration: 0.5,
      ease: "power2.out",
    });
    cardsRef.current.forEach((card, i) => {
      gsap.to(card, { scale: i === index ? 1.2 : 1, duration: 0.5 });
    });
  };

  useEffect(() => {
    if (!searchQuery.trim() || filteredItems.length === 0) return;

    // Delay ensures DOM updates before scrolling
    setTimeout(() => {
      const firstCard = cardsRef.current[0];
      if (firstCard) {
        firstCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 300);
  }, [searchQuery]);

  const handleNavigation = (direction) => {
    if (filteredItems.length === 0) return;
    let newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
    newIndex = (newIndex + filteredItems.length) % filteredItems.length;
    scrollToCard(newIndex);
  };

  const handleAddToCart = (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add items to the cart.");
      navigate("/login");
      return;
    }

    if ((item.stock ?? 0) < 1) {
      alert("Item is out of stock!");
      return;
    }

    setSelectedItem(item);
    addToCart(item, quantity);
    setAddedToCart(true);
    setToastMessage(`${item.name} added to tray 🍽️`);
    setTimeout(() => {
      setAddedToCart(false);
      setSelectedItem(null);
      setToastMessage("");
    }, 2000);
  };

  return (
    <div
      className="flex flex-col h-screen items-center justify-center overflow-hidden relative"
      style={{ backgroundImage: "url(/assets/bg4.png)", backgroundSize: "cover" }}
    >
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-all duration-500">
          {toastMessage}
        </div>
      )}

      <button
        className="absolute left-4 bg-orange-500 text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("left")}
      >
        &lt;
      </button>

      <div ref={containerRef} className="relative flex gap-10">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="slider-card w-60 h-80 flex flex-col items-center justify-center bg-white/30 backdrop-blur-lg shadow-lg border border-white rounded-xl p-4 transition-transform transform hover:scale-105 hover:shadow-2xl relative group"
              onClick={() => scrollToCard(index)}
            >
              {bestSellingItems.some(bestItem => bestItem.name === item.name) && (
                <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Best Seller</span>
              )}
              <img src={item.image} alt={item.title} className="w-40 h-40 object-cover rounded-lg mb-4" />
              <h3 className="text-lg font-semibold text-black">{item.name}</h3>
              {item.stock <= 1 ? (
                <span className="mt-2 text-red-600 font-semibold">Out of Stock</span>
              ) : (
                <button onClick={() => handleAddToCart(item)} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md">
                  Add to Tray
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-white text-lg font-semibold">No items found</p>
        )}
      </div>

      <button
        className="absolute right-4 bg-orange-500 text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("right")}
      >
        &gt;
      </button>
    </div>
  );
};

export default CardSlider;
