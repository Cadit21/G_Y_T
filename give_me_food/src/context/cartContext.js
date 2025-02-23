import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from local storage or backend
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
      setCart([]); // Ensure cart is reset when no user is found
    }
  }, []);
  

  const updateCart = async (updatedCart) => {
    console.log("Updated Cart:", updatedCart);  // Debugging log
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      await axios.put("http://localhost:5000/api/cart", {
        userId: storedUser.id,
        cart: updatedCart,
      });
    }
  };
  

  const addToCart = (item, quantity) => {
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = cart.map((cartItem, index) =>
        index === existingItemIndex
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
    } else {
      updatedCart = [...cart, { ...item, quantity }];
    }

    updateCart(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};
