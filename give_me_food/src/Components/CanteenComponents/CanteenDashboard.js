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
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
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
        <Sidebar menuItems={["Today's Sales","Order History","Best Selling Items"]} onMenuSelect={(view) => { setView(view.toLowerCase()); setSidebarOpen(false); }} />
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-x-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Canteen Dashboard</h1>

        <div className="flex flex-wrap gap-4 mb-4">
          <Button onClick={() => setView("orders")} variant="outline">View Orders</Button>
          <Button onClick={() => setView("products")} variant="outline">View Products</Button>
        </div>

        {view === "orders" && (
  <Card title="Orders">
    <div className="overflow-x-auto">
      <Table
        headers={["Order ID", "Customer Name", "Items", "Total Price", "Status"]}
        data={orders
          .filter(order => order.status === "Pending" || order.status === "Preparing") // Filter orders
          .map((order) => ({
            "Order ID": order._id,
            "Customer Name": order.customerName,
            "Items": order.items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
            "Total Price": `₹${order.totalPrice}`,
            "Status": order.status
          }))}
      />
    </div>
  </Card>
)}

        

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
