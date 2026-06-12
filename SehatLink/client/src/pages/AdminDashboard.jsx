import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Users,
  DollarSign,
  Stethoscope,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Star,
  FileText,
  Settings,
  User,
  Shield,
  Loader,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
    reports: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (
      tab &&
      [
        "overview",
        "users",
        "doctors",
        "patients",
        "appointments",
        "reports",
        "settings",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Get user from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      const userId = userData?.id;

      console.log("=== FRONTEND DEBUG ===");
      console.log("User from localStorage:", userData);
      console.log("User ID:", userId);

      if (!userId) {
        console.error("No user ID found");
        toast.error("Please login again");
        return;
      }

      // Simple config without Bearer token
      const config = {
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId.toString(), // Send user ID in header
        },
      };

      // Also add userId to query params as backup
      const baseUrl = "http://localhost:5000/api/admin";

      console.log("Making API calls with userId:", userId);

      // Fetch stats
      const statsRes = await axios.get(
        `${baseUrl}/stats?userId=${userId}`,
        config,
      );
      console.log("Stats response:", statsRes.data);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch users
      const usersRes = await axios.get(
        `${baseUrl}/users?userId=${userId}`,
        config,
      );
      console.log("Users response:", usersRes.data);
      if (usersRes.data.success) {
        const users = usersRes.data.users || [];
        setAllUsers(users);
        setAllDoctors(users.filter((u) => u.role === "doctor"));
        setAllPatients(users.filter((u) => u.role === "patient"));
      }

      // Fetch appointments
      const appointmentsRes = await axios.get(
        `${baseUrl}/appointments?userId=${userId}`,
        config,
      );
      console.log("Appointments response:", appointmentsRes.data);
      if (appointmentsRes.data.success) {
        setAllAppointments(appointmentsRes.data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User deleted successfully");
        fetchAllData();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("User role updated successfully");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader size={48} className="text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-blue-100">
                    Here's what's happening with your healthcare platform today.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <p className="text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        Rs. {stats.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-4 py-2">
                      <p className="text-sm">Active Users</p>
                      <p className="text-2xl font-bold">
                        {stats.totalUsers || stats.patients + stats.doctors}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Activity size={80} className="text-white/20" />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Patients"
                value={stats.patients}
                icon={User}
                color="bg-green-500"
              />
              <StatCard
                title="Total Doctors"
                value={stats.doctors}
                icon={Stethoscope}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Appointments"
                value={stats.appointments}
                icon={Calendar}
                color="bg-purple-500"
              />
              <StatCard
                title="Total Revenue"
                value={stats.revenue}
                icon={DollarSign}
                color="bg-yellow-500"
              />
            </div>

            {/* Recent Users & Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    Recent Users
                  </h3>
                  <span className="text-xs text-gray-500">Last 10</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {allUsers.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user.role === "doctor"
                                ? "bg-blue-100"
                                : user.role === "admin"
                                  ? "bg-purple-100"
                                  : "bg-green-100"
                            }`}
                          >
                            <span
                              className={`font-bold ${
                                user.role === "doctor"
                                  ? "text-blue-600"
                                  : user.role === "admin"
                                    ? "text-purple-600"
                                    : "text-green-600"
                              }`}
                            >
                              {user.name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "doctor"
                              ? "bg-blue-100 text-blue-700"
                              : user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    Recent Appointments
                  </h3>
                  <span className="text-xs text-gray-500">Last 10</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {allAppointments.slice(0, 5).map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {apt.patient_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            with {apt.doctor_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">
                All Users ({filteredUsers.length})
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-5 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            user.role === "doctor"
                              ? "bg-blue-100"
                              : user.role === "admin"
                                ? "bg-purple-100"
                                : "bg-green-100"
                          }`}
                        >
                          <span
                            className={`font-bold text-lg ${
                              user.role === "doctor"
                                ? "text-blue-600"
                                : user.role === "admin"
                                  ? "text-purple-600"
                                  : "text-green-600"
                            }`}
                          >
                            {user.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Joined:{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleUpdateRole(user.id, e.target.value)
                          }
                          className="px-2 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                All Doctors ({allDoctors.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {allDoctors.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  No doctors found
                </div>
              ) : (
                allDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="border rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {doctor.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-gray-500">{doctor.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        Phone: {doctor.phone || "Not provided"}
                      </p>
                      <p className="text-gray-600">
                        City: {doctor.city || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                All Patients ({allPatients.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {allPatients.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12">
                  No patients found
                </div>
              ) : (
                allPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">
                          {patient.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        Phone: {patient.phone || "Not provided"}
                      </p>
                      <p className="text-gray-600">
                        City: {patient.city || "Not provided"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                All Appointments ({allAppointments.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {allAppointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No appointments found
                </div>
              ) : (
                allAppointments.map((apt) => (
                  <div key={apt.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {apt.patient_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          with Dr. {apt.doctor_name}
                        </p>
                        <div className="flex gap-3 mt-2">
                          <p className="text-xs text-gray-400">
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              apt.appointment_date,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                        {apt.symptoms && (
                          <p className="text-sm text-gray-500 mt-2">
                            Symptoms: {apt.symptoms}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-12 text-center"
          >
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Medical Reports
            </h3>
            <p className="text-gray-500">Total Reports: {stats.reports}</p>
            <p className="text-sm text-gray-400 mt-4">
              Coming soon: Detailed reports management
            </p>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">
                  System Settings
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-gray-500">
                      Put website under maintenance
                    </p>
                  </div>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Disabled
                  </button>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <p className="font-medium text-gray-800">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Send email notifications to admins
                    </p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
