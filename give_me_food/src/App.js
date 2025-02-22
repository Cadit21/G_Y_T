import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Foodlay from "./Components/foodlay";
import CartPage from "./Components/Cartpage";
import img from "./images/front.png";
import { CartProvider } from "./context/cartContext";
import ChatWidget from "./Components/Chatwidget";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
      
        <Routes>
          <Route path="/" element={<Foodlay />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>

        <ChatWidget/>
      </Router>
    </CartProvider>
  );
}

export default App;
