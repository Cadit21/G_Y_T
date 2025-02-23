import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Foodlay from "./Components/foodlay";
import CartPage from "./Components/Cartpage";
import { CartProvider } from "./context/cartContext";
import ChatWidget from "./Components/Chatwidget";
import LoginForm from "./Components/LoginForm";
import Register from "./Components/Register";
import LoadingScreen from "./Components/LoadingScreen"; // Import the loading screen
import RegisterForm from "./Components/RegisterForm";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay (or wait until resources load)
    setTimeout(() => setLoading(false), 3000); // Adjust time as needed
  }, []);

  return (
    <CartProvider>
      <Router>
        {loading ? (
          <LoadingScreen /> // Show loading screen while loading
        ) : (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Foodlay />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
            </Routes>
            <ChatWidget />
          </>
        )}
      </Router>
    </CartProvider>
  );
}

export default App;
