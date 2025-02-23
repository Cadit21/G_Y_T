import React, { useState } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-200 to-orange-400 px-4">
      <div className="bg-white bg-opacity-30 backdrop-blur-md shadow-xl rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-orange-600 mb-4">Create an Account</h2>
        {message && <p className="mb-4 text-red-700 font-semibold">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="relative">
            <FiUser className="absolute left-3 top-3 text-gray-600" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-50 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-all duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-orange-600 mt-4">
          Already have an account? <a href="/login" className="underline">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
