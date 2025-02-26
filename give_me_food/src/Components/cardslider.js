import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const cards = [
  {
    id: 1,
    image: "/assets/burger.png",
    title: "Burger",
    price: "₹5.99",
    description:
      "A juicy grilled beef patty with fresh lettuce, tomatoes, and cheese in a sesame bun.",
  },
  {
    id: 2,
    image: "/assets/pizza.png",
    title: "Pizza",
    price: "₹8.99",
    description:
      "Delicious cheesy pizza with a crispy crust and rich tomato sauce.",
  },
  {
    id: 3,
    image: "/assets/pasta.png",
    title: "Pasta",
    price: "₹7.49",
    description:
      "Creamy Alfredo pasta with grilled chicken and parmesan cheese.",
  },
  {
    id: 4,
    image: "/assets/sushi.png",
    title: "Sushi",
    price: "₹12.99",
    description: "Freshly made sushi rolls with salmon, avocado, and rice.",
  },
  {
    id: 5,
    image: "/assets/salad.png",
    title: "Salad",
    price: "₹6.49",
    description:
      "A healthy mix of greens, cherry tomatoes, cucumbers, and a tangy dressing.",
  },
  {
    id: 6,
    image: "/assets/icecream.png",
    title: "Ice Cream",
    price: "₹3.99",
    description:
      "Creamy vanilla ice cream with chocolate chips and caramel drizzle.",
  },
];

const CardSlider = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const spacing = 250;

  useEffect(() => {
    gsap.set(cardsRef.current, (index) => ({
      x: index * spacing - (cards.length * spacing) / 2 + spacing / 2,
      scale: index === currentIndex ? 1.2 : 1,
      opacity: 0,
    }));

    gsap.to(cardsRef.current, { opacity: 1, duration: 1, stagger: 0.2 });

    Draggable.create(containerRef.current, {
      type: "x",
      inertia: true,
      bounds: { minX: -cards.length * spacing, maxX: spacing },
      snap: (value) => {
        const newIndex =
          Math.round(
            (value + (cards.length * spacing) / 2 - spacing / 2) / spacing
          ) % cards.length;
        setCurrentIndex(newIndex);
        return Math.round(value / spacing) * spacing;
      },
    });
  }, [currentIndex]);

  const handleNavigation = (direction) => {
    let newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;
    newIndex = (newIndex + cards.length) % cards.length;
    scrollToCard(newIndex);
  };

  const scrollToCard = (index) => {
    setCurrentIndex(index);
    gsap.to(cardsRef.current, {
      x: -index * spacing + (cards.length * spacing) / 2 - spacing / 2,
      duration: 0.5,
      ease: "power2.out",
    });
    cardsRef.current.forEach((card, i) => {
      gsap.to(card, { scale: i === index ? 1.2 : 1, duration: 0.5 });
    });
  };

  return (
    <div
      className="flex h-screen items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: "url(/assets/bg4.png)",
        backgroundSize: "cover",
      }}
    >
      <button
        className="absolute right-4 bg-orange-500 backdrop-blur-lg text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("right")}
      >
        &gt;
      </button>

      <div ref={containerRef} className="relative flex gap-10">
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="slider-card w-60 h-80 flex flex-col items-center justify-center bg-white/30 backdrop-blur-lg shadow-lg border border-white rounded-xl p-4 transition-transform transform hover:scale-105 hover:shadow-2xl relative group"
            onClick={() => scrollToCard(index)}
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-40 h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold text-black">{card.title}</h3>
            <p className="text-gray-900 font-bold">{card.price}</p>
            <button className="mt-2 px-4 py-2 bg-gradient-to-r from-black to-orange-500 text-white rounded-md hover:from-gray-900 hover:to-orange-400 transition-all">
              Add to Tray
            </button>

            {/* Description */}
            <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-sm p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-t-xl">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      <button
        className="absolute left-4 bg-orange-500 backdrop-blur-lg text-white p-5 rounded-full z-20 opacity-70 hover:bg-orange-400 transition-all duration-300"
        onClick={() => handleNavigation("left")}
      >
        &lt;
      </button>
    </div>
  );
};

export default CardSlider;
