import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen"; // Import LoadingScreen
import { useContext } from "react";
import { CartContext } from "../context/cartContext";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false); 

  const emailRef = useRef(null);
  const { setCart } = useContext(CartContext); 
  const navigate = useNavigate();

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
      emailRef.current.style.outline = "2px solid orange";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading screen
    
     
    
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });

      // Store token and user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const userRole = res.data.user?.role || "user"; // Ensure role is set
    localStorage.setItem("role", userRole);
    window.dispatchEvent(new Event("storage")); // Force reactivity
    

      // Show success message
      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        setLoading(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      setLoading(false); // Stop loading if login fails
      setMessage(error.response?.data?.message || "Login failed");
      setMessageType("error");
    }
  };

  return (
    <>
      {loading ? (
        <LoadingScreen /> // Show loading screen while redirecting
      ) : (
        <div
          className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 sm:px-6"
          style={{ backgroundImage: "url('/assets/background.jpg')" }}
        >
          <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-orange-900 bg-opacity-80 backdrop-blur-md text-white">
            <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

            {message && (
              <div
                className={`p-3 mb-4 rounded-lg text-white ${
                  messageType === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block">Email</label>
                <input
                  type="email"
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg">
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
