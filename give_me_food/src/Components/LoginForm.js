import { useState, useRef, useEffect } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
      emailRef.current.style.outline = "2px solid orange";
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Attempted", { email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 sm:px-6" style={{ backgroundImage: "url('/assets/background.jpg')" }}>
      <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-orange-900 bg-opacity-80 backdrop-blur-md text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
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
            />
          </div>
          <button type="submit" className="w-full bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
