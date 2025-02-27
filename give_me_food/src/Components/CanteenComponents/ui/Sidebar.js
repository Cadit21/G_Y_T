import { FiHome, FiClipboard, FiTrendingUp } from "react-icons/fi"; 

const Sidebar = ({ menuItems, onMenuSelect, activeItem }) => {
  const icons = {
    "Dashboard": <FiHome className="mr-3" />,
    "Order History": <FiClipboard className="mr-3" />,
    "Best Selling Items": <FiTrendingUp className="mr-3" />,
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-xl rounded-r-lg">
      <h2 className="text-2xl font-semibold mb-6 tracking-wide text-gray-200">
        Canteen Dashboard
      </h2>
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => onMenuSelect(item)}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300
              ${activeItem === item ? "bg-blue-500 text-white" : "hover:bg-gray-700"}
            `}
          >
            {icons[item] || <FiHome className="mr-3" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
