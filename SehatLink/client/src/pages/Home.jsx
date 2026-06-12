import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Stethoscope,
  Calendar,
  FileText,
  MessageCircle,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Award,
  Users,
  Heart,
  ChevronRight,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: Stethoscope,
      title: "Top Doctors",
      desc: "Find verified specialists near you",
      color: "blue",
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      desc: "Schedule appointments online",
      color: "green",
    },
    {
      icon: FileText,
      title: "Digital Reports",
      desc: "Access medical reports anytime",
      color: "purple",
    },
    {
      icon: MessageCircle,
      title: "Secure Chat",
      desc: "Chat with your doctor",
      color: "orange",
    },
  ];

  const stats = [
    { value: "500+", label: "Verified Doctors", icon: Users },
    { value: "10,000+", label: "Happy Patients", icon: Heart },
    { value: "24/7", label: "Online Support", icon: Clock },
    { value: "4.9", label: "Patient Rating", icon: Star },
  ];

  const testimonials = [
    {
      name: "Ahmed R.",
      role: "Patient",
      comment:
        "Excellent service! Found the best cardiologist through SehatLink.",
      rating: 5,
    },
    {
      name: "Fatima K.",
      role: "Patient",
      comment: "Very easy to book appointments. Highly recommended!",
      rating: 5,
    },
    {
      name: "Dr. Usman",
      role: "Doctor",
      comment: "Great platform for doctors to connect with patients.",
      rating: 5,
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6"
              >
                <Heart size={16} className="text-red-300" />
                <span className="text-white text-sm">
                  Pakistan's Leading Healthcare Platform
                </span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Your Health, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Our Priority
                </span>
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Book appointments with top doctors, access medical records, and
                get personalized health recommendations - all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/doctors")}
                  className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  Find a Doctor <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Stethoscope className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      24/7 Emergency Care
                    </p>
                    <p className="text-blue-200 text-sm">
                      Immediate assistance available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Easy Appointment Booking
                    </p>
                    <p className="text-blue-200 text-sm">Schedule in seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Digital Medical Records
                    </p>
                    <p className="text-blue-200 text-sm">
                      Access anytime, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="text-blue-600" size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50" ref={ref}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800">
              Why Choose SehatLink?
            </h2>
            <p className="text-gray-500 mt-2">
              Comprehensive healthcare at your fingertips
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon
                    className={`text-${feature.color}-600`}
                    size={28}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
            <p className="text-gray-500 mt-2">Simple steps to get started</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up as a patient or doctor",
                icon: Users,
              },
              {
                step: "02",
                title: "Find a Doctor",
                desc: "Search by specialty, city, or name",
                icon: Stethoscope,
              },
              {
                step: "03",
                title: "Book Appointment",
                desc: "Schedule your visit online",
                icon: Calendar,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/3 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-y-1/2" />
                )}
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="text-white" size={32} />
                </div>
                <div className="text-4xl font-bold text-blue-100 mb-2">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              What Our Users Say
            </h2>
            <p className="text-gray-500 mt-2">
              Trusted by thousands of patients and doctors
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-md"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8">
              Join thousands of satisfied patients and doctors on SehatLink
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                Create Account <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/doctors")}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                Find a Doctor
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
