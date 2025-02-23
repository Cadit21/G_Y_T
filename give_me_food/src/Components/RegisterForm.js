import { useState, useRef, useEffect } from "react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registration Attempted", { name, email, password });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 sm:px-6" style={{ backgroundImage: "url('/assets/background.jpg')" }}>
      <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-orange-900 bg-opacity-80 backdrop-blur-md text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
              placeholder="Enter your name"
            />
          </div>
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
          <div>
            <label className="block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 bg-transparent text-white placeholder-gray-300 ${passwordMatch ? "focus:ring-orange-500" : "focus:ring-red-500 border-red-500"}`}
              placeholder="Confirm your password"
            />
            {!passwordMatch && <p className="text-red-400 text-sm mt-1">Passwords do not match</p>}
          </div>
          <button type="submit" className="w-full bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg">
            Register
          </button>
        </form>
        <p className="text-center mt-4">
          Already registered? <a href="/login" className="text-orange-300 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
