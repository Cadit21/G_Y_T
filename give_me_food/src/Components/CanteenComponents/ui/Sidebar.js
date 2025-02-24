 const Sidebar = ({ menuItems, onMenuSelect }) => {
    return (
      <div className="w-64 h-screen bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Canteen Dashboard</h2>
        <ul>
          {menuItems.map((item, index) => (
            <li
              key={index}
              onClick={() => onMenuSelect(item)}
              className="p-2 hover:bg-gray-700 cursor-pointer rounded"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default Sidebar;