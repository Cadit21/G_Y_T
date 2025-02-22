import { useState } from "react";
import { Menu, ShoppingCart, Search, X } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link
import logo from "../images/logo.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

        {/* Cart Button */}
        <Link to="/cart" className="relative">
          <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            <ShoppingCart size={24} />
          </button>
        </Link>

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
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Login
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
            Order
          </button>
        </div>
      </div>

      {/* Dropdown Menu for Small Screens */}
      {isMenuOpen && (
        <div className="absolute top-16 right-2 bg-white shadow-lg rounded-lg flex flex-col w-30 p-2 space-y-2 md:hidden">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Login
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
            Order
          </button>
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
