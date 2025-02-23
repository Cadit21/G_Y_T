import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null); // State for message
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password });

      // Store token in localStorage
      localStorage.setItem("token", res.data.token);

      // Show success message
      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      // Redirect to home screen after 2 seconds
      setTimeout(() => navigate("/"), 2000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setMessageType("error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-200 to-orange-300 px-4">
      <div className="bg-white bg-opacity-30 backdrop-blur-md shadow-xl rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-orange-600 mb-4">Login</h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded-lg text-white ${
              messageType === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-600" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-3 text-gray-600" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-all duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-orange-600 mt-4">
          Don't have an account? <a href="/register" className="underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
