import React, { useState } from "react";
import "tailwindcss/tailwind.css";

const foodItems = [
  {
    id: 1,
    name: "Pizza",
    image: "https://example.com/pizza.jpg",
    price: 1000,
    description: "Delicious cheese pizza with a crispy crust.",
  },
  {
    id: 2,
    name: "Burger",
    image: "https://example.com/burger.jpg",
    price: 500,
    description: "Juicy beef burger with fresh vegetables.",
  },
  {
    id: 3,
    name: "Pasta",
    image: "https://example.com/pasta.jpg",
    price: 700,
    description: "Pasta in a rich tomato sauce with herbs.",
  },
  {
    id: 4,
    name: "Sushi",
    image: "https://example.com/sushi.jpg",
    price: 1200,
    description: "Fresh sushi rolls with wasabi and soy sauce.",
  },
  {
    id: 5,
    name: "Salad",
    image: "https://example.com/salad.jpg",
    price: 400,
    description: "Healthy green salad with a variety of veggies.",
  },
  {
    id: 6,
    name: "Tacos",
    image: "https://example.com/tacos.jpg",
    price: 800,
    description: "Spicy and flavorful beef tacos with toppings.",
  },
  {
    id: 7,
    name: "Sandwich",
    image: "https://example.com/sandwich.jpg",
    price: 600,
    description: "Classic club sandwich with fresh ingredients.",
  },
  {
    id: 8,
    name: "Steak",
    image: "https://example.com/steak.jpg",
    price: 1500,
    description: "Juicy grilled steak with sides.",
  },
  {
    id: 9,
    name: "Ice Cream",
    image: "https://example.com/icecream.jpg",
    price: 300,
    description: "Cold and creamy ice cream in various flavors.",
  },
  {
    id: 10,
    name: "Fries",
    image: "https://example.com/fries.jpg",
    price: 350,
    description: "Crispy and golden French fries.",
  },
  {
    id: 11,
    name: "Doughnut",
    image: "https://example.com/doughnut.jpg",
    price: 250,
    description: "Sweet and delicious glazed doughnut.",
  },
  {
    id: 12,
    name: "Smoothie",
    image: "https://example.com/smoothie.jpg",
    price: 500,
    description: "Refreshing fruit smoothie.",
  },
];

const Cart = () => {
  const [cart, setCart] = useState(
    foodItems.map((item) => ({ ...item, quantity: 1, selected: false }))
  );

  const handleQuantityChange = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const toggleSelection = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const totalCost = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const selectedCost = cart
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/Your_tray.png')",
        backgroundSize: "cover",
        backgroundPosition: "right 0px bottom -100px ",
      }}
    >
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4 shadow-xl w-full max-w-sm h-96 overflow-y-auto">
        <div className="space-y-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-2 p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg shadow-md"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="flex-1 text-white">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm">₹{item.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="px-3 py-1 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800 transition-transform transform active:scale-90"
                >
                  -
                </button>
                <span className="text-white text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="px-3 py-1 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-transform transform active:scale-90"
                >
                  +
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelection(item.id)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-white mt-4 text-lg">
        <p>Total: ₹{totalCost}</p>
        <p>Selected: ₹{selectedCost}</p>
      </div>

      <div className="flex space-x-2 mt-4">
        <button className="px-6 py-2 bg-orange-700 text-white rounded-full shadow-lg hover:bg-orange-800 transition-transform transform active:scale-90 text-sm">
          Buy All
        </button>
        <button className="px-6 py-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-transform transform active:scale-90 text-sm">
          Buy Selected
        </button>
      </div>
    </div>
  );
};

export default Cart;
