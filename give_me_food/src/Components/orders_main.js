import React from "react";

const OrderCard = ({ order }) => {
  return (
    <div className="bg-gray-700 bg-opacity-20 backdrop-blur-lg shadow-md rounded-lg p-4 mb-4 border border-white border-opacity-30 w-full">
      <h2 className="text-xl font-semibold mb-2">Order ID: {order.id}</h2>
      <p
        className={`font-medium ${
          order.status === "Completed" ? "text-green-600" : "text-yellow-600"
        }`}
      >
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
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-1">
                    {item.qty}
                  </td>
                  <td className="border border-gray-300 px-3 py-1">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 font-semibold">
                    ₹{(item.qty * item.price).toFixed(2)}
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
  const orders = [
    {
      id: "12345",
      status: "Completed",
      items: [
        { name: "Item A", qty: 2, price: 150 },
        { name: "Item B", qty: 1, price: 200 },
        { name: "Item C", qty: 3, price: 120 },
        { name: "Item D", qty: 1, price: 300 },
      ],
    },
    {
      id: "67890",
      status: "Pending",
      items: [
        { name: "Item C", qty: 3, price: 100 },
        { name: "Item D", qty: 2, price: 250 },
      ],
    },
    {
      id: "11223",
      status: "Processing",
      items: [
        { name: "Item E", qty: 1, price: 500 },
        { name: "Item F", qty: 4, price: 75 },
      ],
    },
  ];

  return (
    <div
      className="h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/Your_order.png')",
        backgroundPosition: "bottom -90px right 1px",
      }}
    >
      <div className="pt-32 w-full h-full px-4 flex justify-left">
        {/* Container for all orders with fixed height and scrollable content */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg shadow-lg rounded-2xl p-6 w-full max-w-5xl border border-gray-800 mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Your Orders</h1>

          {/* Scrollable area for order cards */}
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
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
