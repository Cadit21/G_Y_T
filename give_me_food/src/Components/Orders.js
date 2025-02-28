import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Pending: "text-yellow-500",
  Preparing: "text-blue-500",
  Completed: "text-green-500",
  Cancelled: "text-red-500",
};

const OrderCard = ({ order }) => {
  return (
    <div className="bg-gray-700 bg-opacity-20 backdrop-blur-lg shadow-md rounded-lg p-4 mb-4 border border-white border-opacity-30 w-full">
      <h2 className="text-xl font-semibold mb-2">Order ID: {order._id}</h2>
      <p className={`font-medium ${statusColors[order.status]}`}>
        Status: {order.status}
      </p>
      <div className="mt-3">
        <h3 className="text-lg font-medium">Items:</h3>
        <div className="max-h-40 overflow-y-auto mt-2">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="sticky top-0">
              <tr className="bg-gray-100 bg-opacity-30">
                <th className="border border-gray-300 px-3 py-1">Item Name</th>
                <th className="border border-gray-300 px-3 py-1">Quantity</th>
                <th className="border border-gray-300 px-3 py-1">Price</th>
                <th className="border border-gray-300 px-3 py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr
                  key={index}
                  className="text-center border border-gray-300 odd:bg-gray-700 even:bg-gray-800 text-white"
                >
                  <td className="border border-gray-300 px-3 py-1">
                    {item.productId.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-1">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-1">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 font-semibold">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!token || !storedUser?.id) {
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/orders/user/${storedUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
    <div
      className="h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/Your_order.png')",
        backgroundPosition: "bottom -90px right 1px",
      }}
    >
      <div className="pt-32 w-full h-full px-4 flex justify-left">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg shadow-lg rounded-2xl p-6 w-full max-w-5xl border border-gray-800 mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Your Orders</h1>

          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order._id} order={order} />)
            ) : (
              <p className="text-gray-300">No orders available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
