import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Foodlay from "./Components/foodlay";
import CartPage from "./Components/Cartpage";
import { CartProvider } from "./context/cartContext";
import ChatWidget from "./Components/Chatwidget";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import LoadingScreen from "./Components/LoadingScreen";
import CanteenLogin from "./Components/CanteenComponents/LoginFormCan"; // ✅ Import Canteen Login
import CanteenRegister from "./Components/CanteenComponents/CanteenRegister"; // ✅ Import Canteen Register
import CanteenDashboard from "./Components/CanteenComponents/CanteenDashboard"; // ✅ Import Canteen Dashboard
import HomePage from "./Components/homepage";

function App() {
  const [loading, setLoading] = useState(true);
  const showNavbar = !window.location.pathname.includes("canteen");

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);

  return (
    <CartProvider>
      <Router>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
           
            <Routes>
              {/* User Side */}
              
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />

              {/* ✅ Canteen Side */}
              <Route path="/canteen-login" element={<CanteenLogin />} />
              <Route path="/canteen-register" element={<CanteenRegister />} />
              <Route path="/canteen-dashboard" element={<CanteenDashboard/>} />
              
            </Routes>
            <ChatWidget />
          </>
        )}
      </Router>
    </CartProvider>
  );
}

export default App;
