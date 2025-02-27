import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Pending: "text-yellow-500",
  Preparing: "text-blue-500",
  Completed: "text-green-500",
  Cancelled: "text-red-500",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
        try {
          const token = localStorage.getItem("token");
          const storedUser = JSON.parse(localStorage.getItem("user"));
      
          console.log("Token:", token); // ✅ Check if token exists
          console.log("User ID:", storedUser?.id); // ✅ Check if user ID exists
      
          if (!token || !storedUser?.id) {
            navigate("/login");
            return;
          }
      
          const res = await axios.get(`http://localhost:5000/api/orders/user/${storedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          console.log("Orders fetched:", res.data); // ✅ See what comes back
          setOrders(res.data);
          setError("");
        } catch (err) {
          console.error("Error fetching orders:", err?.response?.data || err.message);
          setError("Failed to fetch orders. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      

    fetchOrders();
  }, [navigate]);

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded-lg shadow-md">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p className={`font-medium ${statusColors[order.status]}`}>
                <strong>Status:</strong> {order.status}
              </p>
              <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
              <h3 className="font-semibold mt-2">Items:</h3>
              <ul className="list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.productId._id}>
                    {item.productId.name} - {item.quantity} x ₹{item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
