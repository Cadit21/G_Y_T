import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/cartContext";
import img from "../images/tray.jpg";

const HomePage = () => {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle cart click
  const handleCartClick = () => {
    if (token) {
      navigate("/cart");
    } else {
      alert("Please log in to view your cart!");
      navigate("/login");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/"); // Redirect to homepage
    window.location.reload(); // Reload to update UI
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-col relative"
      style={{ backgroundImage: "url('/assets/bg3.png')" }}
    >
      <nav className="absolute top-0 left-0 w-full bg-transparent p-4 flex flex-wrap items-center justify-between shadow-md z-10">
        {/* Logo */}
        <img src="/assets/logo2.png" alt="Logo" className="h-8 md:h-10" />

        {/* Search Bar */}
        <div className="flex-grow mx-4 hidden sm:flex justify-center">
          <div className="relative w-full max-w-lg">
            <input 
              type="text" 
              placeholder="Search for something cool..." 
              className="w-full px-4 py-2 bg-transparent text-white placeholder-gray-400 border border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm transition-all duration-200"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-500 transition-all">
              <svg className="text-white" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"> 
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/> 
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
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
            <button 
              onClick={handleLogout} 
              className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-red-400"
            >
              Logout
            </button>
          ) : (
            <>
              <a href="/login" className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-orange-400">Login</a>
              <a href="/register" className="px-3 py-1 text-white text-sm md:text-lg font-semibold hover:text-orange-400">Register</a>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
