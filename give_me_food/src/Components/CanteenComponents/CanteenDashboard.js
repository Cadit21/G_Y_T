import React, { useState, useEffect } from "react";
import Sidebar from "./ui/Sidebar";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Table from "./ui/Table";
import axios from "axios";
import { FiMenu } from "react-icons/fi";

const CanteenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("orders");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "", stock: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    
    fetchProducts();
     if (view === "orders") {
    fetchOrders();
  } else if (view === "Order History") {
    fetchOrderHistory();
  }
}, [view]);


const fetchOrders = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/orders");

    const ordersWithDetails = (res.data || []).map(order => ({
      ...order,
      customerName: order.userId?.username || "Unknown", // ✅ Show username
      items: order.items.map(item => ({
        name: item.productId?.name || "Unknown Item", // ✅ Show product name
        quantity: item.quantity,
        price: item.price
      }))
    })).filter(order => order.status !== "Completed");

    setOrders(ordersWithDetails);
  } catch (error) {
    console.error("Error fetching orders:", error);
    setOrders([]);
  }
};


  const fetchOrderHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders"); // Use `/order-history` if backend is updated
      setOrders((res.data || []).filter(order => order.status === "Completed")); // ✅ Show only completed orders
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrders([]);
    }
  };
  
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log("Updating order:", orderId, "to status:", newStatus);
  
      const res = await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });
  
      console.log("Order updated successfully:", res.data);
  
      if (newStatus === "Completed") {
        // ✅ Remove order from UI if marked as Completed
        setOrders(orders.filter(order => order._id !== orderId));
      } else {
        // ✅ Otherwise, just update order status in UI
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error("Error updating order status:", error.response?.data || error.message);
    }
  };
  
  
  

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Name and price are required!");
      return;
    }
  
    try {
      const res = await axios.post("http://localhost:5000/api/food", newProduct);
      setProducts([...products, res.data]);
      setNewProduct({ name: "", price: "", category: "", description: "", stock: "", type: "", image: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding product", error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/food");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await axios.put(`http://localhost:5000/api/food/${editingProduct._id}`, editingProduct);
      setProducts(products.map(product => 
        product._id === editingProduct._id ? editingProduct : product
      ));
      setEditingProduct(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error updating product", error);
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/food/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
        
      <button className="md:hidden p-4" onClick={() => setSidebarOpen(!sidebarOpen)}>
      {sidebarOpen && (
    <div 
    className="fixed inset-0 bg-black opacity-50 md:hidden"
    onClick={() => setSidebarOpen(false)}
  ></div>
)}
        <FiMenu size={24} />
      </button>

      {/* Overlay for Closing Sidebar (Mobile Only) */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 bg-black opacity-50 md:hidden"
      onClick={() => setSidebarOpen(false)}
    ></div>
  )}
      <div className={`fixed md:relative bg-white z-10 transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-64 w-3/4 h-full shadow-lg`}>  
        <Sidebar menuItems={["Today's Sales","Order History","Best Selling Items"]} onMenuSelect={(view) => {  setView(view); setSidebarOpen(false); }} />
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-x-auto w-full">
        

        <div className="flex flex-wrap gap-4 mb-4">
          <Button onClick={() => setView("orders")} variant="outline">View Orders</Button>
          <Button onClick={() => setView("products")} variant="outline">View Products</Button>
        </div>
        

        {view === "orders" && (
  <Card title="Orders">
    <div className="overflow-x-auto">
      <Table
        headers={["Order ID", "Customer Name", "Items", "Total Price", "Status", "Actions"]}
        data={orders.map((order) => ({
          "Order ID": order._id,
          "Customer Name": order.customerName,
          "Items": order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
          "Total Price": `₹${order.totalPrice}`,
          "Status": (
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
              className="border p-1 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          ),
          "Actions": (
            <button
              onClick={() => handleStatusChange(order._id, "Completed")}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Mark as Completed
            </button>
          )
        }))}
      />
    </div>
  </Card>
)}

<div className="flex-1 p-4 md:p-8 overflow-x-auto w-full">
  

  {/* Render different sections based on selected view */}
  {view === "Today's Sales" && (
    <Card title="Today's Sales">
      <p>Show sales statistics, total revenue, and orders for today.</p>
    </Card>
  )}

{view === "Order History" && (
  <Card title="Order History">
    <Table
      headers={["Order ID", "Customer Name", "Items", "Total Price", "Date", "Status"]}
      data={orders
        .filter(order => order.status === "Completed") // ✅ Filter only completed orders
        .map((order) => ({
          "Order ID": order._id,
          "Customer Name": order.customerName,
          "Items": order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
          "Total Price": `₹${order.totalPrice}`,
          "Date": new Date(order.createdAt).toLocaleDateString(),
          "Status": order.status
        }))}
    />
  </Card>
)}


  {view === "Best Selling Items" && (
    <Card title="Best Selling Items">
      <p>Show list of best-selling items based on order frequency.</p>
    </Card>
  )}
</div>


        

        {view === "products" && (
          <Card title="Products">
            <div className="mb-4 flex justify-between items-center">
              <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-500 text-white px-4 py-2">
                {showAddForm ? "Cancel" : "Add Product"}
              </Button>
            </div>

            {showAddForm && (
  <div className="mb-4 p-4 border rounded bg-white">
    <h2 className="text-lg font-bold mb-2">
      {editingProduct ? "Edit Product" : "Add New Product"}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {["name", "category", "description", "price", "stock", "type", "image"].map((field) => (
        <input
          key={field}
          type={field === "price" || field === "stock" ? "number" : "text"}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={editingProduct ? editingProduct[field] : newProduct[field]}
          onChange={(e) =>
            editingProduct
              ? setEditingProduct({ ...editingProduct, [field]: e.target.value })
              : setNewProduct({ ...newProduct, [field]: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      ))}
    </div>

    <div className="mt-4 flex gap-2">
      {editingProduct ? (
        <>
          <Button onClick={handleUpdateProduct} className="bg-green-500 text-white px-4 py-2">
            Save
          </Button>
          <Button onClick={() => { setEditingProduct(null); setShowAddForm(false); }} className="bg-gray-500 text-white px-4 py-2">
            Cancel
          </Button>
        </>
      ) : (
        <Button onClick={handleAddProduct} className="bg-blue-500 text-white px-4 py-2">
          Add Product
        </Button>
      )}
    </div>
  </div>
)}


              

            
            <div className="overflow-x-auto">
              <Table headers={["Product Name", "Category", "Description", "Price", "Stock", "Actions"]} data={products.map((product) => ({
                "Product Name": product.name,
                "Category": product.category,
                "Description": product.description,
                "Price": `₹${product.price}`,
                "Stock": product.stock,
                "Actions": (
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditProduct(product)} className="bg-blue-500 text-white px-2 py-1">Edit</Button>
                    <Button onClick={() => handleDeleteProduct(product._id)} className="bg-red-500 text-white px-2 py-1">Delete</Button>
                  </div>
                )
              }))} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CanteenDashboard;
