import React, { useContext } from "react";
import { CartContext } from "../context/cartContext";
import { Link } from "react-router-dom";

function CartPage() {
  const { cart } = useContext(CartContext);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center mt-4">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Go to Menu
          </Link>
        </div>
      ) : (
        <div className="mt-6 bg-white p-4 shadow-md rounded-lg">
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="flex justify-between items-center border-b p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                  </p>
                </div>
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg" />
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right font-semibold text-xl">
            Total: ₹{cart.reduce((acc, item) => acc + item.price * item.quantity, 0)}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
