import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CanteenLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login-canteen", { email, password });

      if (res.data.role === "canteen_staff") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        navigate("/canteen-dashboard");
      } else {
        setError("Access denied! Not a canteen owner.");
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Canteen Owner Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-3 text-gray-600">
          Don't have an account?{" "}
          <a href="/canteen-register" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default CanteenLogin;
