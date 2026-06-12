import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Stethoscope,
  Heart,
  Bell,
  LogOut,
  User,
  Calendar,
  LayoutDashboard,
  FileText,
  Menu,
  X,
  Users,
  DollarSign,
  Clock,
  MessageCircle,
  Activity,
  Settings,
  Shield,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  let navLinks = [];
  if (user?.role === "patient") {
    navLinks = [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Appointments", path: "/appointments", icon: Calendar },
      { name: "Find Doctors", path: "/doctors", icon: Stethoscope },
      { name: "Messages", path: "/chat", icon: MessageCircle },
      { name: "Reports", path: "/reports", icon: FileText },
      { name: "Profile", path: "/profile", icon: User },
    ];
  } else if (user?.role === "doctor") {
    navLinks = [
      { name: "Dashboard", path: "/doctor-dashboard", icon: LayoutDashboard },
      { name: "My Patients", path: "/doctor-patients", icon: Users },
      { name: "Messages", path: "/chat", icon: MessageCircle },
      { name: "Earnings", path: "/doctor-earnings", icon: DollarSign },
      { name: "Profile", path: "/doctor-profile", icon: User },
    ];
  } else if (user?.role === "admin") {
    navLinks = [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Users", path: "/admin-users", icon: Users },
      { name: "Doctors", path: "/admin-doctors", icon: Stethoscope },
      { name: "Appointments", path: "/admin-appointments", icon: Calendar },
    ];
  }

  const isActive = (path) => location.pathname === path;
  if (!user) {
    return (
      <>
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">
                  SehatLink
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="h-16"></div>
      </>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-md"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-xl font-bold text-gray-800">SehatLink</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={18} />
                </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3 pb-3 mb-2 border-b">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(link.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition mt-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;