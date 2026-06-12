import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Stethoscope,
  DollarSign,
  Activity,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Heart,
  Shield,
  Star,
  ChevronRight,
  Sparkles,
  Video,
  MessageCircle,
  FileText,
  Bell,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    rating: 4.8,
  });

  useEffect(() => {
    fetchAppointments();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        const response = await axios.get(
          `http://localhost:5000/api/appointments/my?userId=${userData.id}`,
        );
        const data = response.data.appointments || [];
        setAppointments(data);
        setStats({
          total: data.length,
          completed: data.filter((a) => a.status === "completed").length,
          pending: data.filter((a) => a.status === "pending").length,
          revenue: data.reduce((sum, a) => sum + (a.amount || 0), 0),
          rating: 4.8,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      cancelled: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
      confirmed: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
      pending: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending} shadow-sm`}
      >
        {status}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statsCards = [
    {
      title: "Total Appointments",
      value: stats.total,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      change: "+12%",
      color: "blue",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: Activity,
      gradient: "from-green-500 to-emerald-500",
      change: "+8%",
      color: "green",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      change: "+5%",
      color: "yellow",
    },
    {
      title: "Total Spent",
      value: `Rs. ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-purple-500 to-pink-500",
      change: "+15%",
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="relative px-6 py-8 md:px-8 md:py-10">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                    <span className="text-blue-100 text-sm font-medium">
                      {greeting}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome back, {user?.name?.split(" ")[0]}! 👋
                  </h1>
                  <p className="text-blue-100 mt-1">
                    Here's what's happening with your health today
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-300" />
                      <span className="text-white text-sm font-medium">
                        Health Score: 92
                      </span>
                    </div>
                  </div>
                  <button className="bg-white/20 backdrop-blur rounded-full p-2 hover:bg-white/30 transition">
                    <Bell className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards with 3D Hover Effect */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500`}
              ></div>
              <div className="relative bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-5 rounded-full -mr-8 -mt-8"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 text-xs font-medium">
                        {stat.change}
                      </span>
                      <span className="text-gray-400 text-xs">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300`}
                  >
                    <stat.icon className="text-white" size={22} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Stethoscope,
                label: "Book Doctor",
                color: "from-blue-500 to-cyan-500",
                path: "/doctors",
              },
              {
                icon: Video,
                label: "Video Consult",
                color: "from-purple-500 to-pink-500",
                path: "/consult",
              },
              {
                icon: FileText,
                label: "Upload Report",
                color: "from-green-500 to-emerald-500",
                path: "/reports",
              },
              {
                icon: MessageCircle,
                label: "Chat Support",
                color: "from-orange-500 to-red-500",
                path: "/support",
              },
            ].map((action, idx) => (
              <Link key={idx} to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white rounded-xl shadow-md p-4 text-center group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-lg transition`}
                  >
                    <action.icon className="text-white" size={22} />
                  </div>
                  <p className="text-gray-700 font-medium text-sm">
                    {action.label}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Appointments with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Recent Appointments
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Your upcoming and past consultations
              </p>
            </div>
            <Link
              to="/appointments"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 group"
            >
              View All
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition"
              />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-blue-500" />
                </div>
                <p className="text-gray-500 font-medium">No appointments yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Book your first appointment to get started
                </p>
                <Link
                  to="/doctors"
                  className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
                >
                  Find a Doctor
                </Link>
              </div>
            ) : (
              appointments.slice(0, 5).map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition group"
                >
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <Stethoscope size={24} className="text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {apt.doctor_name || `Doctor ID: ${apt.doctor_id}`}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {apt.specialization || "General Physician"}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Calendar size={12} />
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Clock size={12} />
                            {new Date(apt.appointment_date).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <MapPin size={12} />
                            {apt.doctor_city || "Karachi"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(apt.status)}
                      <p className="text-xl font-bold text-gray-800 mt-2">
                        Rs. {apt.amount}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Health Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Health Tip of the Day
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      Stay hydrated! Drink at least 8 glasses of water daily for
                      optimal health.
                    </p>
                  </div>
                </div>
                <button className="bg-white/20 backdrop-blur px-5 py-2 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition">
                  More Tips
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
