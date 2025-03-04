import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Foodlay from "./Components/foodlay";
import CartPage from "./Components/cartpage_main";
import { CartProvider } from "./context/cartContext";
import SupportPopup from "./Components/chatwidget_new";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import LoadingScreen from "./Components/LoadingScreen";
import CanteenLogin from "./Components/CanteenComponents/LoginFormCan"; // ✅ Import Canteen Login
import CanteenRegister from "./Components/CanteenComponents/CanteenRegister"; // ✅ Import Canteen Register
import CanteenDashboard from "./Components/CanteenComponents/CanteenDashboard"; // ✅ Import Canteen Dashboard
import HomePage from "./Components/homepage";
import AdminRegister from "./Components/Admin/Amin_register"; // ✅ Import Admin Register
import AdminLogin from "./Components/Admin/Admin_login"; // ✅ Import Admin Login
import OrderStatus from "./Components/Statuspage";
import Orders from "./Components/orders_main";
import AdminDashboard from "./Components/Admin/Admin_dashboard"; // ✅ Import Admin Dashboard
import ChatWidget from "./Components/chatwidget_new";
function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);

    // Retrieve user from localStorage
    const userData = localStorage.getItem("user");
    console.log("Loaded User Data:", userData); 
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
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
              <Route path="/order-status/:orderId" element={<OrderStatus />} />
              <Route path="/orders" element={<Orders />} />

              {/* Canteen Side */}
              <Route path="/canteen-login" element={<CanteenLogin />} />
              <Route path="/canteen-register" element={<CanteenRegister />} />
              <Route path="/canteen-dashboard" element={<CanteenDashboard />} />

              {/* Admin Side */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>

            {/* ✅ Pass userId and role to SupportPopup */}
            <ChatWidget/>
          </>
        )}
      </Router>
    </CartProvider>
  );
}

export default App;
