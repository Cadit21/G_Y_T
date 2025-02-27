import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Preparing: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const fetchOrderStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(res.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch order status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
    interval = setInterval(fetchOrderStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <p className="text-center mt-4 text-gray-600">Loading...</p>;

  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Order Status</h1>
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
        <p className="mb-4 text-lg"><strong>Order ID:</strong> {order?._id}</p>
        <div className={`mb-4 inline-block px-4 py-2 rounded-lg font-medium ${statusColors[order?.status]}`}>
          <strong>Status:</strong> {order?.status}
        </div>
        <p className="mb-4 text-lg"><strong>Total Price:</strong> ₹{order?.totalPrice}</p>

        <h2 className="text-xl font-bold mt-6 mb-4 border-b pb-2">Items Ordered</h2>
        <ul className="divide-y divide-gray-200">
          {order?.items?.map((item) => (
            <li key={item.productId?._id} className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium text-gray-800">{item.productId?.name || "Unknown Item"}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <span className="text-lg font-semibold text-gray-800">₹{item.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderStatus;
