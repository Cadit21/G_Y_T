import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-600 relative overflow-hidden w-full h-full">
      {/* Animated Background Glow (Fades with Logo) */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        animate={{
          opacity: [0, 0.1, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      />

      {/* Floating Ember Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-50"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.8 + 0.3,
          }}
          animate={{
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight - 100],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth - 100],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central Logo with Fading Effect */}
      <motion.img
        src="./assets/logo.png"
        alt="Logo"
        className="absolute w-24 h-24 z-20"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
    </div>
  );
};

export default LoadingScreen;
