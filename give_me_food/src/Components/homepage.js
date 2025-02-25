import React from "react";
import CardSlider from "./cardslider"; // Import the CardSlider component

const HomePage = () => {
  return (
    <div className="w-full h-screen overflow-y-auto">
      {/* Hero Section */}
      <div
        className="h-screen w-full bg-cover bg-center flex flex-col relative"
        style={{ backgroundImage: "url('/assets/bg3.png')" }}
      >
        <nav className="absolute top-0 left-0 w-full bg-transparent p-4 flex justify-between items-center shadow-md z-10">
          <img src="/assets/logo2.png" alt="Logo" className="h-8" />
          <div className="flex flex-grow relative mx-4">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search for something cool..."
                className="w-full px-4 py-2 bg-transparent text-white placeholder-gray-300 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-[0px_0px_15px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-200"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent text-orange-400 hover:text-orange-500 transition-all">
                <svg
                  className="text-white"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex space-x-6 items-center">
            <a href="/cart">
              <img src="/assets/image.png" alt="Tray" className="h-8" />
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-white text-lg font-semibold font-[Gotham] relative after:content-[''] after:w-0 after:h-[2px] after:bg-white after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300 after:ease-in-out hover:after:w-full"
            >
              Login
            </a>
            <a
              href="/register"
              className="px-4 py-2 text-white text-lg font-semibold font-[Gotham] relative after:content-[''] after:w-0 after:h-[2px] after:bg-white after:absolute after:left-0 after:bottom-0 after:transition-all after:duration-300 after:ease-in-out hover:after:w-full"
            >
              Register
            </a>
          </div>
        </nav>
      </div>
      
      {/* CardSlider Component */}
      <CardSlider />
    </div>
  );
};

export default HomePage;
