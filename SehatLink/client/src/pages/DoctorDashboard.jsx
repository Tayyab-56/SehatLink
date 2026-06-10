import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Activity,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  MessageCircle,
  Video,
  UserCheck,
  UserX,
  ChevronRight,
  Star,
  Award,
  Heart,
  FileText,
  Loader,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    patients: 0,
    rating: 4.8,
    todayAppointments: 0
  });
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    fetchDoctorData();
    fetchAppointments();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        const doctorRes = await axios.get(
          `http://localhost:5000/api/doctors/by-user/${userData.id}`
        );
        setDoctorInfo(doctorRes.data.doctor);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        console.log("Fetching appointments for doctor userId:", userData.id);
        const response = await axios.get(
          `http://localhost:5000/api/appointments/doctor?userId=${userData.id}`
        );
        console.log("Doctor appointments response:", response.data);
        const data = response.data.appointments || [];
        setAppointments(data);

        const pending = data.filter((a) => a.status === "pending").length;
        const confirmed = data.filter((a) => a.status === "confirmed").length;
        const completed = data.filter((a) => a.status === "completed").length;
        const cancelled = data.filter((a) => a.status === "cancelled").length;
        const revenue = data
          .filter((a) => a.status === "completed")
          .reduce((sum, a) => sum + (a.amount || 0), 0);
        const uniquePatients = [...new Set(data.map((a) => a.patient_id))]
          .length;

        setStats({
          total: data.length,
          pending,
          confirmed,
          completed,
          cancelled,
          revenue,
          patients: uniquePatients,
          rating: 4.9,
          todayAppointments: data.filter(
            (a) =>
              new Date(a.appointment_date).toDateString() ===
              new Date().toDateString()
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!userData || !userData.id) {
        toast.error("User not logged in");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        {
          status: status,
          userId: userData.id,
        }
      );

      if (response.data.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
        setSelectedAppointment(null);
      } else {
        toast.error(response.data.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to update appointment"
      );
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = apt.patient_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || apt.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    );
  };

  // Color mapping for stats cards (using fixed colors instead of dynamic)
  const getCardColor = (index) => {
    const colors = [
      { border: "border-blue-500", bg: "bg-blue-100", text: "text-blue-600" },
      { border: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-600" },
      { border: "border-green-500", bg: "bg-green-100", text: "text-green-600" },
      { border: "border-purple-500", bg: "bg-purple-100", text: "text-purple-600" },
      { border: "border-indigo-500", bg: "bg-indigo-100", text: "text-indigo-600" },
      { border: "border-pink-500", bg: "bg-pink-100", text: "text-pink-600" },
    ];
    return colors[index % colors.length];
  };

  const statsCards = [
    { title: "Total Appointments", value: stats.total, icon: Calendar, change: "+12%" },
    { title: "Pending", value: stats.pending, icon: Clock, change: "+5%" },
    { title: "Confirmed", value: stats.confirmed, icon: CheckCircle, change: "+8%" },
    { title: "Completed", value: stats.completed, icon: Activity, change: "+15%" },
    { title: "Total Revenue", value: `Rs. ${stats.revenue.toLocaleString()}`, icon: DollarSign, change: "+20%" },
    { title: "Unique Patients", value: stats.patients, icon: Users, change: "+10%" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
              <p className="text-blue-100 mt-1">Welcome back, Dr. {user?.name}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Star size={14} className="text-yellow-300 fill-yellow-300" />
                  <span>{stats.rating} Rating</span>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Users size={14} />
                  <span>{stats.patients} Patients</span>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Activity size={14} />
                  <span>{stats.completed} Completed</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-white text-sm">Today's Schedule</p>
                <p className="text-white font-bold">{stats.todayAppointments} Appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat, idx) => {
            const colors = getCardColor(idx);
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${colors.border}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-xs">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-green-600 text-xs">{stat.change}</p>
                  </div>
                  <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon size={16} className={colors.text} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Appointment Requests</h2>
              <p className="text-gray-500 text-sm">Manage patient appointments</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 hover:bg-gray-50 transition group cursor-pointer"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {apt.patient_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{apt.patient_name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(apt.appointment_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {new Date(apt.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {apt.patient_age && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users size={12} /> Age: {apt.patient_age}
                            </span>
                          )}
                        </div>
                        {apt.symptoms && (
                          <p className="text-sm text-gray-500 mt-1">Symptoms: {apt.symptoms}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(apt.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">Today's Earnings</p>
                <p className="text-2xl font-bold">Rs. {stats.revenue}</p>
              </div>
              <DollarSign size={32} className="text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">Pending Reviews</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Star size={32} className="text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp size={32} className="text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-100 text-sm">Patient Satisfaction</p>
                <p className="text-2xl font-bold">{stats.rating}/5.0</p>
              </div>
              <Heart size={32} className="text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAppointment(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedAppointment.patient_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedAppointment.patient_name}
                    </h3>
                    <p className="text-gray-500">{selectedAppointment.patient_age || 'Age not specified'} years old</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span>{selectedAppointment.patient_phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{new Date(selectedAppointment.appointment_date).toLocaleString()}</span>
                  </div>
                  {selectedAppointment.symptoms && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Symptoms</p>
                      <p className="text-sm text-yellow-700">{selectedAppointment.symptoms}</p>
                    </div>
                  )}
                </div>

                {selectedAppointment.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "confirmed")}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Accept
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                {selectedAppointment.status === "confirmed" && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;