import React, { useEffect, useRef, useState, useContext } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { CartContext } from "../context/cartContext";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(Draggable);

const CardSlider = ({ searchQuery = "" }) => {
  const { addToCart } = useContext(CartContext);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const spacing = 250;

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

  const filteredItems = searchQuery.trim()
    ? foodItems.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : foodItems;

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
      }, 300); // Slight delay ensures elements exist
    }, [searchQuery]);
    

  const handleNavigation = (direction) => {
    if (filteredItems.length === 0) return;
    let newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
    newIndex = (newIndex + filteredItems.length) % filteredItems.length;
    scrollToCard(newIndex);
  };

  const scrollToCard = (index) => {
    setCurrentIndex(index);
    gsap.to(containerRef.current, {
      x: -index * spacing,
      duration: 0.5,
      ease: "power2.out",
    });

    cardsRef.current.forEach((card, i) => {
      gsap.to(card, { scale: i === index ? 1.2 : 1, duration: 0.5 });
    });
  };

  const handleAddToCart = (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add items to the cart.");
      navigate("/login");
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
      style={{
        backgroundImage: "url(/assets/bg4.png)",
        backgroundSize: "cover",
      }}
    >
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-all duration-500">
          {toastMessage}
        </div>
      )}

      <button
        className="absolute right-4 bg-orange-500 text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("right")}
      >
        &gt;
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
              <img
                src={item.image}
                alt={item.title}
                className="w-40 h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-black">{item.name}</h3>
              <p className="text-gray-900 font-bold">{item.price}</p>
              <button
                onClick={() => handleAddToCart(item)}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-black to-orange-500 text-white rounded-md hover:from-gray-900 hover:to-orange-400 transition-all"
              >
                Add to Tray
              </button>
              <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-sm p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-t-xl">
                {item.description}
              </div>
            </div>
          ))
        ) : (
          <p className="text-white text-lg font-semibold">No items found</p>
        )}
      </div>

      <button
        className="absolute left-4 bg-orange-500 text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("left")}
      >
        &lt;
      </button>
    </div>
  );
};

export default CardSlider;
