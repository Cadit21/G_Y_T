import React, { useState, useEffect } from "react";
import Sidebar from "./ui/Sidebar";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Table from "./ui/Table";
import axios from "axios";
import { FiMenu } from "react-icons/fi";
import CanteenChatWidget from "./Canteen_widget";
const CanteenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("orders");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "", stock: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [preparingOrders, setPreparingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);



  useEffect(() => {
    fetchProducts();
  
    console.log("Current View:", view);
    if (view === "orders") {
      fetchOrders();
    } else if (view === "Order History") {
      fetchOrderHistory();
    } else if (view === "Best Selling Items") {
      fetchBestSellingItems(); // Fetch best-selling items when this view is selected
    }
  }, [view]);
  




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
  
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
  
      const ordersWithDetails = (res.data || []).map(order => ({
        ...order,
        customerName: order.username || "Unknown", // ✅ Fetch from correct field
        items: order.items.map(item => ({
          name: item.name || "Unknown Item", // ✅ Corrected path
          quantity: item.quantity,
          price: item.price
        }))
      }));
  
      // ✅ Update order counts before filtering
      updateOrderCounts(ordersWithDetails);
  
      // ✅ Now filter out completed orders
      const pendingOrdersOnly = ordersWithDetails.filter(order => order.status !== "Completed");
  
      setOrders(pendingOrdersOnly);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
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
  const [bestSellingItems, setBestSellingItems] = useState({});

  const fetchBestSellingItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders"); 
      console.log("Fetched Orders:", res.data); // Debugging
  
      const completedOrders = res.data.filter(order => order.status === "Completed");
  
      const productSales = {};
      completedOrders.forEach(order => {
        order.items.forEach(item => {
          const foodName = item.name; // ✅ Ensure name is coming
          const price = item.price || 0; // ✅ Ensure price is valid
          const quantity = item.quantity || 0; // ✅ Ensure quantity is valid
  
          if (foodName) {
            if (!productSales[foodName]) {
              productSales[foodName] = { name: foodName, quantity: 0, revenue: 0 };
            }
            productSales[foodName].quantity += quantity; // ✅ Proper number addition
            productSales[foodName].revenue += price * quantity; // ✅ Calculate revenue correctly
          }
        });
      });
  
      console.log("Final Aggregated Product Sales:", productSales);
      const sortedProductSales = Object.values(productSales).sort((a, b) => b.quantity - a.quantity);
      setBestSellingItems(sortedProductSales); // ✅ Update state with sorted items
  
    } catch (error) {
      console.error("Error fetching best-selling items:", error);
    }
  };
  
  
  const updateOrderCounts = (orders) => {
    const pending = orders.filter(order => order.status === "Pending").length;
    const preparing = orders.filter(order => order.status === "Preparing").length;
    const completed = orders.filter(order => order.status === "Completed").length;
    setPendingOrders(pending);
    setPreparingOrders(preparing);
    setCompletedOrders(completed);
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
        <Sidebar menuItems={["Order History","Best Selling Items"]} onMenuSelect={(view) => {  setView(view); setSidebarOpen(false); }} />
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-x-auto w-full">
        

        <div className="flex flex-wrap gap-4 mb-4">
          <Button onClick={() => setView("orders")} variant="outline">View Orders</Button>
          <Button onClick={() => setView("products")} variant="outline">View Products</Button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-x-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card title="Pending Orders">
            <p>Pending Orders</p>
            <p className="text-xl font-bold">{pendingOrders}</p>
          </Card>
          <Card title="Preparing Orders">
            <p>Preparing Orders</p>
            <p className="text-xl font-bold">{preparingOrders}</p>
          </Card>
          <Card title="Completed Orders">
            <p>Completed Orders</p>
            <p className="text-xl font-bold">{completedOrders}</p>
          </Card>
        </div>
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
      data={orders.map((order) => ({
          "Order ID": order._id,
          "Customer Name": order.username || "Unknown", // ✅ Corrected field
          "Items": order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
          "Total Price": `₹${order.totalPrice}`,
          "Date": new Date(order.orderDate).toLocaleDateString(), // ✅ Corrected Date Field
          "Status": order.status
        }))}
    />
  </Card>
)}


{view === "Best Selling Items" && (
  <Card title="Best Selling Items">
    {Object.keys(bestSellingItems).length > 0 ? (
      <Table
        headers={["Item Name", "Total Sold", "Total Revenue"]}
        data={Object.values(bestSellingItems).map(item => ({
          "Item Name": item.name,
          "Total Sold": item.quantity,
          "Total Revenue": `₹${item.revenue}`
        }))}
      />
    ) : (
      <p>No sales data available.</p>
    )}
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
      <div className="fixed bottom-4 right-4 z-50">
        <CanteenChatWidget />
      </div>
    </div>
    
  );
};

export default CanteenDashboard;
