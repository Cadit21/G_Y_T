import { useState, useRef, useEffect } from "react";

export default function LoginForm() {
  const [loginType, setLoginType] = useState("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
    const loginData =
      loginType === "email" ? { email, password } : { username, password };
    
    console.log("Login Attempted", loginData);
    alert(`Login Attempted with ${loginType}: ${loginType === "email" ? email : username}`);
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 sm:px-6"
      style={{ backgroundImage: "url('/assets/background.jpg')" }}
    >
      <div className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-orange-900 bg-opacity-80 backdrop-blur-md text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login Type Selection */}
          <div className="flex justify-center space-x-4 mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="email"
                checked={loginType === "email"}
                onChange={() => setLoginType("email")}
                className="form-radio text-orange-500"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="username"
                checked={loginType === "username"}
                onChange={() => setLoginType("username")}
                className="form-radio text-orange-500"
              />
              <span>Username</span>
            </label>
          </div>

          {/* Email or Username Input */}
          {loginType === "email" ? (
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
          ) : (
            <div>
              <label className="block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 bg-transparent text-white placeholder-gray-300"
                placeholder="Enter your username"
              />
            </div>
          )}

          {/* Password Input */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-lg"
          >
            Login
          </button>

          {/* Not Registered? Sign Up Link */}
          <p className="text-center mt-2 text-sm">
            Not registered?{" "}
            <span className="text-orange-300 hover:underline cursor-pointer">
              Sign up here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
