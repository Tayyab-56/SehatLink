import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  Zap,
  MessageCircle,
  X,
  ChevronRight,
} from "lucide-react";

const FloatingAIAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    user = { role: null };
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/medical-chatbot"
  ) {
    return null;
  }

  if (user.role !== "patient") {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 1,
        }}
        className="fixed bottom-6 right-6 z-50"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 blur-xl"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/medical-chatbot")}
          className="relative group"
        >
          <div className="relative w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Animated Background Gradient */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
              style={{ backgroundSize: "200% 200%" }}
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
            />
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <BrainCircuit size={32} className="text-white" />
            </motion.div>
            <motion.div
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles size={12} className="text-yellow-300" />
            </motion.div>

            <motion.div
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
              className="absolute -bottom-1 -left-1"
            >
              <Sparkles size={10} className="text-yellow-300" />
            </motion.div>
          </div>
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="absolute -top-2 -right-2"
              >
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Zap size={12} className="text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-red-400 opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-20 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-3 min-w-[200px] border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <BrainCircuit size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    AI Symptom Checker
                  </p>
                  <p className="text-xs text-gray-500">Powered by Medical AI</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">24/7 Available</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <MessageCircle size={10} />
                  <span>Describe your symptoms</span>
                </div>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <div className="w-3 h-3 bg-white rotate-45 border-r border-t border-gray-100"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BrainCircuit size={18} />
                  <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-white/20 rounded-lg p-1 transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-600 mb-3">
                Describe your symptoms for a quick analysis
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., I have fever..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={() => navigate("/medical-chatbot")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-xl text-sm hover:shadow-md transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAIAssistant;