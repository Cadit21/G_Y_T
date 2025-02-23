import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Foodlay from "./Components/foodlay";
import CartPage from "./Components/Cartpage";
import img from "./images/front.png";
import { CartProvider } from "./context/cartContext";
import ChatWidget from "./Components/Chatwidget";
import { LogIn } from "lucide-react";
import Login from "./Components/Login";
import Register from "./Components/Register";
import LoginForm from "./Components/LoginForm";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
      
        <Routes>
          <Route path="/" element={<Foodlay />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/register" element={<Register />} />
        </Routes>

        <ChatWidget/>
      </Router>
    </CartProvider>
  );
}

export default App;
