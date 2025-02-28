import React, { useContext, useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { CartContext } from "../context/cartContext";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen"; // Adjust the path as needed


const CartPage = () => {
  const { cart, setCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.id;
        if (!userId) throw new Error("User not found. Please log in again.");

        const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch cart");

        const data = await response.json();
        // Assuming the API returns a cart array with product info,
        // add local fields for quantity (defaulting to API quantity) and selection
        const cartWithLocalFields = data.cart.map((item) => ({
          ...item,
          quantity: item.quantity || 1,
          selected: false,
        }));
        setCart(cartWithLocalFields);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCart();
    else {
      setLoading(false);
      setError("Please log in to view your cart.");
    }
  }, [token, setCart]);

  // Local UI functions for modifying quantity and selection
  const handleQuantityChange = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId?._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const toggleSelection = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId?._id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Remove an item from the cart (optimistic update)
  const handleRemoveItem = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId?._id !== productId);
    setCart(updatedCart);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id;
      if (!userId) throw new Error("User not found. Please log in again.");

      const response = await fetch(
        `http://localhost:5000/api/cart/${userId}/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to remove item from cart");
    } catch (err) {
      // Revert UI update on error
      setCart(cart);
      setError(err.message);
    }
  };

  // Calculations for total cost and selected items
  const totalCost = cart.reduce(
    (total, item) => total + (item.productId?.price || 0) * item.quantity,
    0
  );
  const selectedCost = cart
    .filter((item) => item.selected)
    .reduce((total, item) => total + (item.productId?.price || 0) * item.quantity, 0);

    const placeOrder = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
    
        if (!storedUser || !storedUser.id) {
          throw new Error("User not found. Please log in again.");
        }
    
        if (!token) {
          throw new Error("Authentication token missing. Please log in again.");
        }
    
        const selectedItems = cart.filter(item => item.selected);
        if (!selectedItems || selectedItems.length === 0) {
          throw new Error("No items selected for order.");
        }
    
        console.log('Selected Items:', selectedItems);
    
        const orderData = {
          userId: storedUser.id,
          items: selectedItems.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity
          })),
          paymentMethod: "UPI",
        };
    
        console.log("Order Data:", JSON.stringify(orderData, null, 2)); 
    
        const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });
    
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to place order: ${errorMessage}`);
        }
    
        const data = await response.json();
        console.log("Order response:", data);
    
        if (!data.order._id) {
          throw new Error("Invalid order response: Order ID is missing.");
        }
    
        navigate(`/order-status/${data.order._id}`);
    
        setCart(cart.filter(item => !item.selected));
        alert("Order placed successfully!");
    
      } catch (error) {
        console.error("Error placing order:", error.message);
        alert(error.message);
      }
    };
  

    if (loading) {
      return <LoadingScreen />;
    }
    
  if (error) return <div className="text-center mt-4 text-red-500">{error}</div>;

  return (
    <div
    className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4"
    style={{
      backgroundImage: "url('/assets/Your_tray.png')",
      backgroundSize: "cover",
      backgroundPosition: "right 0px bottom -140px",
    }}
  >
    {/* Logo */}
    <Link to="/" className="absolute top-4 left-4">
      <img
        src="/assets/logo2.png"
        alt="Logo"
        className="w-16 h-16 md:w-20 md:h-20 cursor-pointer"
        onClick={() => navigate("/")} 
      />
    </Link>
  
    <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Your Cart</h1>
  
    {cart.length === 0 ? (
      <div className="text-center mt-4">
        <p className="text-gray-400">Your cart is empty.</p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Go to Menu
        </Link>
      </div>
    ) : (
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4 shadow-xl overflow-y-auto max-h-96">
          <div className="space-y-3">
            {cart.map((item) => {
              if (!item.productId) return null;
              return (
                <div
                  key={item.productId._id}
                  className="flex flex-wrap items-center space-x-2 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-md"
                >
                  {/* Product Image */}
                  <img
                    src={item.productId.image}
                    alt={item.productId.name}
                    className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-md"
                  />
  
                  <div className="flex-1 text-white">
                    <h2 className="text-sm md:text-base font-semibold">{item.productId.name}</h2>
                    <p className="text-xs md:text-sm">₹{item.productId.price}</p>
                  </div>
  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId._id, -1)}
                      className="px-2 py-1 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800 transition-transform transform active:scale-90"
                    >
                      -
                    </button>
                    <span className="text-white text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId._id, 1)}
                      className="px-2 py-1 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-transform transform active:scale-90"
                    >
                      +
                    </button>
                  </div>
  
                  {/* Selection Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelection(item.productId._id)}
                      className="h-4 w-4"
                    />
                  </div>
  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.productId._id)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* Cost Section */}
        <div className="text-white mt-4 text-sm md:text-lg flex justify-between">
          <p>Total: ₹{totalCost}</p>
          <p>Selected: ₹{selectedCost}</p>
        </div>
  
        {/* Place Order Button */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition"
            onClick={placeOrder}
          >
            Place Order
          </button>
        </div>
      </div>
    )}
  </div>
  
  );
};

export default CartPage;
