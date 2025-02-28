import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/cartContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen'; // Adjust the path as needed

function CartPage() {
  const { cart, setCart } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
   const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = storedUser?.id;

        if (!userId) throw new Error('User not found. Please log in again.');

        const response = await fetch(`http://localhost:5000/api/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCart();
    else {
      setLoading(false);
      setError('Please log in to view your cart.');
    }
  }, [token, setCart]);

  const handleRemoveItem = async (productId) => {
    // Optimistically update the UI
    const updatedCart = cart.filter(item => item.productId._id !== productId);
    setCart(updatedCart);

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?.id;

      if (!userId) throw new Error('User not found. Please log in again.');

      const response = await fetch(`http://localhost:5000/api/cart/${userId}/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err) {
      // Revert the UI update if the API call fails
      setCart(cart);
      setError(err.message);
    }
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.productId?.price || 0) * item.quantity, 0);
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
  
      if (!cart || cart.length === 0) {
        throw new Error("Your cart is empty.");
      }
  
      console.log("✅ Cart Items Before Order:", cart);
  
      const orderData = {
        userId: storedUser.id,
        items: cart.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity
        })),
        paymentMethod: "UPI",
      };
  
      console.log("📦 Sending Order Data:", JSON.stringify(orderData, null, 2));
  
      // ✅ Send order request to backend
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
  
      console.log("📨 Order Response Status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to place order: ${errorText}`);
      }
  
      const data = await response.json();
      console.log("✅ Order Placed Successfully:", data);
  
      if (!data.order._id) {
        throw new Error("Invalid order response: Order ID is missing.");
      }
  
      // ✅ Remove ordered items from cart in the backend
      console.log("🗑 Removing ordered items from cart...");
  
      let failedRemovals = [];
  
      for (const item of cart) {
        console.log(`🔹 Attempting to delete item: ${item.productId._id}`);
  
        try {
          const deleteResponse = await fetch(`http://localhost:5000/api/cart/${storedUser.id}/${item.productId._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log(`📨 Delete Response Status for ${item.productId._id}:`, deleteResponse.status);
  
          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error(`❌ Failed to remove item ${item.productId._id} from cart:`, errorText);
            failedRemovals.push(item.productId._id);
          } else {
            console.log(`✅ Item ${item.productId._id} removed from cart successfully`);
          }
        } catch (err) {
          console.error(`❌ Error deleting ${item.productId._id}:`, err.message);
          failedRemovals.push(item.productId._id);
        }
      }
  
      if (failedRemovals.length > 0) {
        console.warn("⚠️ Some items were not removed from the cart:", failedRemovals);
      }
  
      // ✅ Update cart in the frontend
      const updatedCart = cart.filter(item => failedRemovals.includes(item.productId._id));
      setCart(updatedCart);
      console.log("🛒 Updated Cart After Order:", updatedCart);
  
      alert("🎉 Order placed successfully!");
      navigate(`/order-status/${data.order._id}`);
  
    } catch (error) {
      console.error("❌ Error placing order:", error.message);
      alert(error.message);
    }
  };
  
  

  if (loading) return <LoadingScreen />; // Render the custom loading screen
  if (error) return <div className="text-center mt-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center mt-4">
          <p className="text-gray-500">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Go to Menu
          </Link>
        </div>
      ) : (
        <div className="mt-6 bg-white p-4 shadow-md rounded-lg">
          <ul>
            {cart.map((item, index) => {
              if (!item.productId) return null; // Skip if product data is missing

              return (
                <li key={index} className="flex justify-between items-center border-b p-3">
                  <div>
                    <p className="font-medium">{item.productId.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ₹{item.productId.price} = ₹{item.quantity * item.productId.price}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <img src={item.productId.image} alt={item.productId.name} className="w-12 h-12 rounded-lg" />
                    <button
                      onClick={() => handleRemoveItem(item.productId._id)}
                      className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 text-right font-semibold text-xl">Total: ₹{totalAmount}</div>

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
}

export default CartPage;
