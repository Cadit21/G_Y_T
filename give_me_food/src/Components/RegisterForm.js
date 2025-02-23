import { useState, useRef, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const [username, setusername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
   const [message, setMessage] = useState('');
   const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
      emailRef.current.style.outline = "2px solid orange";
    }
  }, []);

  useEffect(() => {
    setPasswordMatch(password === confirmPassword || confirmPassword === "");
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 sm:px-6" 
      style={{ backgroundImage: "url('/assets/background.jpg')" }}>
      
      {/* Form Container */}
      <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-orange-900 bg-opacity-80 backdrop-blur-md text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>
        {message && <p className="mb-4 text-red-700 font-semibold">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold">Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              className="w-full px-3 py-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold">Email</label>
            <input
              type="email"
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-orange-500 rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-transparent text-white placeholder-gray-300 
                ${passwordMatch ? "focus:ring-orange-500 border-orange-500" : "focus:ring-red-500 border-red-500"}`}
              placeholder="Confirm your password"
              required
            />
            {!passwordMatch && <p className="text-red-400 text-sm mt-1">Passwords do not match</p>}
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            className="w-full bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg font-semibold transition-all duration-300">
            Register
          </button>

        </form>

        {/* Login Redirect */}
        <p className="text-center mt-4">
          Already registered? <a href="/login" className="text-orange-300 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
