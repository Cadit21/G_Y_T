import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;

  // Load cart from backend when component mounts
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/api/cart/${userId}`)
      .then((response) => setCart(response.data.cart || []))
      .catch((error) => {
        console.error("Error loading cart:", error);
        setCart([]); // Fallback to empty cart
      });
  }, [userId]);

  // Function to update cart in backend
  const updateCart = async (updatedCart) => {
    if (!userId) return;

    try {
      await axios.put("http://localhost:5000/api/cart", {
        userId,
        cart: updatedCart.map(({ __v, productId, ...rest }) => ({
          productId: productId._id?.toString() || productId.toString(),
          ...rest,
        })),
      });
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };
// Function to add an item to the cart
// Function to add an item to the cart
const addToCart = async (item, quantity) => {
  if (!item || !item._id) {
    console.error("Invalid item added to cart:", item);
    return;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      throw new Error("User not authenticated. Please log in again.");
    }

    const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: item._id, quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    const data = await response.json();
    setCart(data.cart); // Update the cart state with data from backend
  } catch (err) {
    console.error(err.message);
  }
};


  return (
    <CartContext.Provider value={{ cart, setCart,addToCart,removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

