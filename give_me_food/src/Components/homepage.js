import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardSlider from "./cardslider";
import img from "../images/tray.jpg";
import { CartContext } from "../context/cartContext";
import { FiSearch } from "react-icons/fi"; // Importing search icon

const HomePage = () => {
  const { cart,setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCartClick = () => {
    if (token) {
      navigate("/cart");
    } else {
      alert("Please log in to view your cart!");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Optional: if you're storing user info
    setCart([]); // Clear the cart
    navigate("/");
    window.location.reload();
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setIsSearchOpen(false); // Close search box after searching
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleOrdersClick = () => {
    navigate("/orders");
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="w-full h-screen overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/bg3.png')" }}
    >
      {/* Hero Section */}
      <div className="h-screen w-full flex flex-col relative bg-black/50">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 w-full bg-transparent p-4 flex justify-between items-center shadow-md z-10">
          <img src="/assets/logo2.png" alt="Logo" className="h-8 md:h-10" />

          {/* Search Bar (Visible on medium screens and larger) */}
          <div className="hidden md:flex flex-grow relative mx-4 max-w-lg w-full">
            <div className="w-full relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search for something cool..."
                className="w-full px-4 py-2 bg-transparent text-white placeholder-gray-300 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-[0px_0px_15px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent text-orange-400 hover:text-orange-500 transition-all"
              >
                <FiSearch className="text-white" size={20} />
              </button>
            </div>
          </div>

          {/* Search Icon (Visible on small screens) */}
          <button onClick={() => setIsSearchOpen(true)} className="md:hidden text-white">
            <FiSearch size={24} />
          </button>

          {/* Mobile Search Input */}
          {isSearchOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-50">
              <div className="w-3/4 flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search..."
                  className="w-full px-2 py-1 bg-transparent outline-none text-black"
                />
                <button onClick={handleSearch} className="text-orange-500">
                  <FiSearch size={24} />
                </button>
                <button onClick={() => setIsSearchOpen(false)} className="text-gray-500 ml-2">
                  ✖
                </button>
              </div>
            </div>
          )}

          {/* Cart & Authentication Buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button onClick={handleCartClick} className="relative">
              <img src={img} alt="Tray" className="h-8 md:h-10 bg-white p-1 rounded-full" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {token ? (
        <>
          <button
            onClick={handleOrdersClick}
            className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-blue-400"
          >
            Orders
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-red-400"
          >
            Logout
          </button>
        </>
      )  : (
              <>
                <a href="/login" className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-orange-400">
                  Login
                </a>
                <a href="/register" className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-orange-400">
                  Register
                </a>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* CardSlider with search query */}
      <div className="p-4 sm:p-8 md:p-12">
        <CardSlider searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default HomePage;
