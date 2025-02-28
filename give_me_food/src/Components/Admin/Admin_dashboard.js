import React, { useState, useEffect } from "react";
import Sidebar from "../CanteenComponents/ui/Sidebar";
import Card from "../CanteenComponents/ui/Card";
import Button from "../CanteenComponents/ui/Button";
import Table from "../CanteenComponents/ui/Table";
import axios from "axios";
import { FiMenu } from "react-icons/fi";

import "react-datepicker/dist/react-datepicker.css";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { PieChart, Pie, Cell } from "recharts";



const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("orders");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", description: "", stock: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesByPayment, setSalesByPayment] = useState([]);
  const [salesByFood, setSalesByFood] = useState([]);
  const [salesByDate, setSalesByDate] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [users, setUsers] = useState([]);

  
  
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF", "#FF6384"];





  
  

  useEffect(() => {
    fetchProducts();
    if (view === "orders") {
      fetchOrders();
    } else if (view === "Order History") {
      fetchOrderHistory();
    } else if (view === "Sales") {
      fetchSalesData();
    } else if (view === "Best Selling Items") {
      fetchBestSellingItems();
    } else if (view === "Users Details") {
      fetchUsers(); // Fetch users when "Users" view is selected
    }
  }, [view]);
  
  
  
  const fetchSalesData = async () => {
    try {
      console.log("Fetching sales data...");
  
      const [totalRes, paymentRes, foodRes, dateRes] = await Promise.all([
        axios.get("http://localhost:5000/api/sales/total"),
        axios.get("http://localhost:5000/api/sales/payment-method"),
        axios.get("http://localhost:5000/api/sales/food-item"),
        axios.get("http://localhost:5000/api/sales/daily"),
      ]);
  
      console.log("Sales data fetched successfully:", {
        totalSales: totalRes.data,
        salesByPayment: paymentRes.data,
        salesByFood: foodRes.data,
        salesByDate: dateRes.data,
      });
  
      setTotalSales(totalRes.data?.totalSales || 0);
      setSalesByPayment(paymentRes.data || []);
      setSalesByFood(foodRes.data || []);
      setSalesByDate(dateRes.data || []);
    } catch (error) {
      console.error("Error fetching sales data:", error.response ? error.response.data : error.message);
      
      // Update state to reflect the error
      setTotalSales(0);
      setSalesByPayment([]);
      setSalesByFood([]);
      setSalesByDate([]);
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
      })).filter(order => order.status !== "Completed"); // ✅ Filter out completed orders
  
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };
  

const fetchUsers = async () => {
  try {
    const res = await axios.get("http://localhost:5000/users");
    setUsers(res.data || []);
  } catch (error) {
    console.error("Error fetching users:", error);
    setUsers([]);
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
        <Sidebar menuItems={["Order History","Best Selling Items","Sales","Users Details"]} onMenuSelect={(view) => {  setView(view); setSidebarOpen(false); }} />
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


{view === "Sales" && (
  <Card title="Total Sales">
    <p className="text-lg font-bold">₹{totalSales}</p>

    {/* Sales Over Time - Line Chart */}
    <h2 className="text-lg font-bold mt-4">Sales Over Time</h2>
    {Array.isArray(salesByDate) && salesByDate.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={salesByDate.map(sale => ({
            date: sale?._id || "Unknown",
            revenue: sale?.totalRevenue || 0,
          }))}
        >
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-red-500">⚠️ No sales data available. Check API response.</p>
    )}

    {/* Food Sales Contribution - Pie Chart */}
    <h2 className="text-lg font-bold mt-6">Sales Contribution by Food</h2>
    {Array.isArray(salesByFood) && salesByFood.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={salesByFood.map((food, index) => ({
              name: food?._id || "Unknown",
              value: food?.revenue || 0,
            }))}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {salesByFood.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <p className="text-red-500">⚠️ No food sales data available.</p>
    )}
  </Card>
)}

{view === "Users Details" && (
  <Card title="Users">
    <div className="overflow-x-auto">
      <Table
        headers={["User ID", "Username", "Email", "Role", "Created At"]}
        data={users.map(user => ({
          "User ID": user._id,
          "Username": user.username,
          "Email": user.email,
          "Role": user.role || "Customer",
          "Created At": new Date(user.createdAt).toLocaleDateString(),
        }))}
      />
    </div>
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
    </div>
  );
};

export default AdminDashboard;
