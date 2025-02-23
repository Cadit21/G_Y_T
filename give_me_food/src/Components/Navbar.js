import { useState, useContext } from "react";
import { Menu, ShoppingCart, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/cartContext"; // Import Cart Context
import logo from "../images/logo.png";
import img from "../images/tray.jpg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cart } = useContext(CartContext); // Get cart items from context
  const navigate = useNavigate();

  // Get Token from Local Storage
  const token = localStorage.getItem("token");

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Redirect to Cart or Ask to Login
  const handleCartClick = () => {
    if (token) {
      navigate("/cart"); // Open cart if logged in
    } else {
      alert("Please log in to view your cart!"); // Ask user to log in first
      navigate("/login"); // Redirect to login page
    }
  };

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      {/* Left Side - Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-10" />
      </Link>

      {/* Center - Search Bar (Hidden on Small Screens) */}
      <div className="hidden md:flex flex-grow mx-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right Side - Icons & Buttons */}
      <div className="flex items-center space-x-4">
        {/* Search Icon for Small Screens */}
        <div className="md:hidden">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            {isSearchOpen ? <X size={24} /> : <Search size={24} />}
          </button>
        </div>

        {/* Cart Button with Item Count */}
        <button
          onClick={handleCartClick}
          className="relative p-2 rounded-lg hover:bg-gray-300 transition"
        >
          <img src={img} className="w-10 h-10" alt="Cart" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        {/* Menu Icon for Small Screens */}
        <div className="block md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Buttons for Larger Screens */}
        <div className="hidden md:flex space-x-4">
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
                  SignUp
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {isMenuOpen && (
        <div className="absolute top-16 right-2 bg-white shadow-lg rounded-lg flex flex-col w-30 p-2 space-y-2 md:hidden">
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
                  SignUp
                </button>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Expanding Search Box (Small Screens) */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 px-6 md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </nav>
  );
}
