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

  
    const token = localStorage.getItem("token");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
   
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
  

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="absolute top-0 left-0 w-full bg-transparent p-4 flex justify-between items-center shadow-md z-10">
              <img src="/assets/logo2.png" alt="Logo" className="h-8 md:h-10" />
    
              {/* Search Bar (Visible on medium screens and larger) */}
             
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
          
  );
}
