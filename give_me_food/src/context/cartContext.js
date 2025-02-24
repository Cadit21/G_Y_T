import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from backend or local storage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      axios
  .get(`http://localhost:5000/api/cart/${storedUser.id}`)
  .then((response) => {
    setCart(response.data.cart || []);
  })
  .catch((error) => {
    console.error("Error loading cart:", error);
    setCart([]);
  });

    } else {
      setCart([]);
    }
  }, []);

  const updateCart = async (updatedCart) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      console.error("No stored user found");
      return;
    }
  
    console.log("Updating Cart with:", updatedCart);
  
    // Ensure productId is properly extracted
    const cleanCart = updatedCart.map(({ __v, productId, ...rest }) => {
      if (!productId) {
        console.error("Missing productId for item:", rest);
        return null; // Skip invalid items
      }
  
      return {
        productId: productId._id || productId, // Ensure correct ID format
        ...rest,
      };
    }).filter(item => item !== null); // Remove invalid items
  
    try {
      await axios.put("http://localhost:5000/api/cart", {
        userId: storedUser.id,
        cart: cleanCart,
      });
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  const addToCart = (item, quantity) => {
    if (!item || !item._id) {
      console.error("Invalid item added to cart:", item);
      return;
    }
  
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem._id === item._id // Ensure correct ID check
      );
  
      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = prevCart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        updatedCart = [...prevCart, { ...item, quantity }];
      }
  
      updateCart(updatedCart);
      return updatedCart;
    });
  };
  
  

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
