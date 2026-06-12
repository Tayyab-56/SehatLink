import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Activity,
  Heart,
  Eye,
  MessageCircle,
  FileText,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  UserPlus,
  X,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

const DoctorPatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.id) {
        const response = await axios.get(
          `http://localhost:5000/api/doctors/patients?userId=${userData.id}`,
        );

        if (response.data.success) {
          setPatients(response.data.patients || []);
          if (response.data.patients?.length === 0) {
            toast.success(
              "No patients found yet. Patients will appear after completed appointments.",
            );
          }
        } else {
          toast.error(response.data.message || "Failed to load patients");
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
      // Demo data for testing
      setPatients([
        {
          id: 1,
          name: "Muhammad Ali",
          age: 34,
          phone: "03001234567",
          email: "ali@example.com",
          last_visit: "2024-01-20",
          total_visits: 5,
          blood_group: "B+",
          allergies: "Penicillin",
          city: "Karachi",
        },
        {
          id: 2,
          name: "Fatima Akhtar",
          age: 28,
          phone: "03111234567",
          email: "fatima@example.com",
          last_visit: "2024-01-15",
          total_visits: 3,
          blood_group: "O+",
          allergies: "None",
          city: "Lahore",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    const matchesFilter =
      filter === "all" ||
      (filter === "recent" &&
        new Date(patient.last_visit) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filter === "frequent" && patient.total_visits > 3);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: patients.length,
    newThisMonth: patients.filter(
      (p) =>
        new Date(p.last_visit) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length,
    followUpRequired: patients.filter((p) => p.total_visits > 2).length,
    avgSatisfaction: 4.8,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
        <p className="text-gray-500 mt-1">View and manage your patient list</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-blue-100 text-sm">Total Patients</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-green-100 text-sm">New This Month</p>
          <p className="text-2xl font-bold">{stats.newThisMonth}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-purple-100 text-sm">Follow-up Required</p>
          <p className="text-2xl font-bold">{stats.followUpRequired}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-orange-100 text-sm">Avg. Satisfaction</p>
          <p className="text-2xl font-bold">{stats.avgSatisfaction}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="all">All Patients</option>
          <option value="recent">Recent Visits</option>
          <option value="frequent">Frequent Visitors</option>
        </select>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No patients found</p>
          <p className="text-gray-400 text-sm mt-1">
            Patients will appear here after they complete appointments with you
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {patient.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {patient.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {patient.age} years
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          Blood: {patient.blood_group || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatient(patient);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Phone size={14} />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Mail size={14} />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={14} />
                    <span>
                      Last visit:{" "}
                      {new Date(patient.last_visit).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Activity size={14} />
                    <span>{patient.total_visits} total visits</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 pt-3 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Medical history feature coming soon");
                    }}
                    className="flex-1 text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-1"
                  >
                    <FileText size={14} /> View History
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("Messaging feature coming soon");
                    }}
                    className="flex-1 text-green-600 text-sm font-medium py-2 rounded-lg hover:bg-green-50 transition flex items-center justify-center gap-1"
                  >
                    <MessageCircle size={14} /> Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">
                  Patient Details
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {selectedPatient.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-gray-500">
                      {selectedPatient.age} years old
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone size={16} /> <span>{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} /> <span>{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} /> <span>{selectedPatient.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart size={16} />{" "}
                    <span>
                      Blood Group: {selectedPatient.blood_group || "N/A"}
                    </span>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      Allergies
                    </p>
                    <p className="text-sm">
                      {selectedPatient.allergies || "None"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      toast.success("Medical history feature coming soon")
                    }
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Medical History
                  </button>
                  <button
                    onClick={() =>
                      toast.success("Schedule follow-up feature coming soon")
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorPatients;
