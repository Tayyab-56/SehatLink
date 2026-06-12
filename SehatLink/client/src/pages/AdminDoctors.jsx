import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Stethoscope,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  DollarSign,
  Clock,
  Loader,
  X,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Hospital,
  FileSpreadsheet,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateDoctorsPDF, generateDoctorsExcel } from "../utils/reportUtils";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [specializations, setSpecializations] = useState([]);
  const [reportType, setReportType] = useState("pdf");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/doctors",
      );
      if (response.data.success) {
        setDoctors(response.data.doctors);
        const uniqueSpecs = [
          ...new Set(
            response.data.doctors.map((d) => d.specialization).filter(Boolean),
          ),
        ];
        setSpecializations(uniqueSpecs);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (doctorId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/doctors/${doctorId}/status`,
        {
          status: newStatus,
        },
      );
      if (response.data.success) {
        toast.success(
          `Doctor ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        );
        fetchDoctors();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (
      window.confirm("Are you sure you want to permanently delete this doctor?")
    ) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/admin/doctors/${doctorId}`,
        );
        if (response.data.success) {
          toast.success("Doctor deleted successfully");
          fetchDoctors();
          setShowModal(false);
        }
      } catch (error) {
        toast.error("Failed to delete doctor");
      }
    }
  };

  const handleUpdateDoctor = async (doctorData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/doctors/${doctorData.id}`,
        doctorData,
      );
      if (response.data.success) {
        toast.success("Doctor updated successfully");
        fetchDoctors();
        setShowEditModal(false);
        setEditingDoctor(null);
      }
    } catch (error) {
      toast.error("Failed to update doctor");
    }
  };

  const handleGenerateReport = async () => {
    if (doctors.length === 0) {
      toast.error("No doctors data available to generate report");
      return;
    }

    setGenerating(true);
    try {
      const stats = {
        total: doctors.length,
        active: doctors.filter((d) => d.status === "active").length,
        inactive: doctors.filter((d) => d.status === "inactive").length,
        avgExperience:
          Math.round(
            doctors.reduce((acc, d) => acc + (d.experience || 0), 0) /
              doctors.length,
          ) || 0,
        avgRating:
          doctors.reduce((acc, d) => acc + (d.rating || 0), 0) /
            doctors.length || 0,
        totalPatients: doctors.reduce(
          (acc, d) => acc + (d.totalPatients || 0),
          0,
        ),
        totalEarnings: doctors.reduce(
          (acc, d) => acc + (d.totalEarnings || 0),
          0,
        ),
      };

      if (reportType === "pdf") {
        // Call the function directly (it's synchronous)
        generateDoctorsPDF(doctors, stats);
        toast.success("PDF report generated and downloaded successfully!");
      } else if (reportType === "excel") {
        generateDoctorsExcel(doctors);
        toast.success("Excel report generated and downloaded successfully!");
      }
      setShowReportModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(
        error.message || "Failed to generate report. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickExport = () => {
    if (doctors.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const exportData = doctors.map((d) => ({
        "Doctor ID": d.id,
        Name: d.name,
        Email: d.email,
        Phone: d.phone || "N/A",
        City: d.city || "N/A",
        Specialization: d.specialization || "N/A",
        "Experience (Years)": d.experience || 0,
        "Consultation Fee (Rs.)": d.fee || 0,
        Rating: d.rating || 0,
        Status: d.status === "active" ? "Active" : "Inactive",
        Hospital: d.hospital || "N/A",
        "Total Patients": d.totalPatients || 0,
        "Total Earnings (Rs.)": d.totalEarnings || 0,
      }));

      const csv = convertToCSV(exportData);
      downloadCSV(
        csv,
        `doctors_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  // Chart data
  const statusChartData = [
    {
      name: "Active",
      value: doctors.filter((d) => d.status === "active").length,
      color: "#10b981",
    },
    {
      name: "Inactive",
      value: doctors.filter((d) => d.status === "inactive").length,
      color: "#ef4444",
    },
  ];

  const topSpecializations = Object.entries(
    doctors.reduce((acc, d) => {
      const spec = d.specialization || "Other";
      acc[spec] = (acc[spec] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || doctor.status === statusFilter;
    const matchesSpecialization =
      specializationFilter === "all" ||
      doctor.specialization === specializationFilter;
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSpecializationFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
    toast.success("Filters reset");
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Doctor Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all doctors, update profiles, and control account status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Doctors</p>
            <p className="text-2xl font-bold">{doctors.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Active Doctors</p>
            <p className="text-2xl font-bold">
              {doctors.filter((d) => d.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Inactive Doctors</p>
            <p className="text-2xl font-bold">
              {doctors.filter((d) => d.status === "inactive").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Avg Experience</p>
            <p className="text-2xl font-bold">
              {Math.round(
                doctors.reduce((acc, d) => acc + (d.experience || 0), 0) /
                  doctors.length,
              ) || 0}{" "}
              yrs
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Avg Rating</p>
            <p className="text-2xl font-bold">
              {(
                doctors.reduce((acc, d) => acc + (d.rating || 0), 0) /
                  doctors.length || 0
              ).toFixed(1)}{" "}
              ★
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">Total Patients</p>
            <p className="text-2xl font-bold">
              {doctors
                .reduce((acc, d) => acc + (d.totalPatients || 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {/* Report and Export buttons in filter row */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
            >
              <FileText size={16} />
              Generate Report
            </button>
            <button
              onClick={handleQuickExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {currentDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {doctor.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-blue-600">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleStatus(doctor.id, doctor.status)
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(doctor.status)}`}
                    >
                      {doctor.status === "active" ? (
                        <UserCheck size={12} />
                      ) : (
                        <UserX size={12} />
                      )}
                      {doctor.status || "active"}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{doctor.phone || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{doctor.city || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hospital size={14} />
                      <span className="truncate">
                        {doctor.hospital || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-semibold">
                        {doctor.experience || 0} years
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Fee</p>
                      <p className="font-semibold text-green-600">
                        Rs. {doctor.fee?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-semibold flex items-center justify-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        {doctor.rating || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Patients</p>
                      <p className="font-semibold">
                        {doctor.totalPatients || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm flex items-center justify-center gap-1"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => {
                        setEditingDoctor(doctor);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm flex items-center justify-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredDoctors.length)} of{" "}
              {filteredDoctors.length} doctors
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg transition ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Generate Report
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReportType("pdf")}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      reportType === "pdf"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <FileText
                      size={32}
                      className={
                        reportType === "pdf" ? "text-blue-600" : "text-gray-400"
                      }
                    />
                    <span
                      className={`font-medium ${reportType === "pdf" ? "text-blue-600" : "text-gray-600"}`}
                    >
                      PDF Report
                    </span>
                    <span className="text-xs text-gray-400">
                      Professional, printable format
                    </span>
                  </button>
                  <button
                    onClick={() => setReportType("excel")}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      reportType === "excel"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <FileSpreadsheet
                      size={32}
                      className={
                        reportType === "excel"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={`font-medium ${reportType === "excel" ? "text-green-600" : "text-gray-600"}`}
                    >
                      Excel Report
                    </span>
                    <span className="text-xs text-gray-400">
                      Editable spreadsheet format
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Report Summary
                </h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• Total Doctors: {doctors.length}</p>
                  <p>
                    • Active Doctors:{" "}
                    {doctors.filter((d) => d.status === "active").length}
                  </p>
                  <p>
                    • Inactive Doctors:{" "}
                    {doctors.filter((d) => d.status === "inactive").length}
                  </p>
                  <p>
                    • Avg Rating:{" "}
                    {(
                      doctors.reduce((acc, d) => acc + (d.rating || 0), 0) /
                        doctors.length || 0
                    ).toFixed(1)}{" "}
                    ★
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {generating
                    ? "Generating..."
                    : `Generate ${reportType.toUpperCase()}`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Doctor Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {selectedDoctor.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Dr. {selectedDoctor.name}
                  </h3>
                  <p className="text-blue-600">
                    {selectedDoctor.specialization}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star
                      size={16}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="font-medium">
                      {selectedDoctor.rating || 0}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {selectedDoctor.experience || 0} years experience
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">{selectedDoctor.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">
                    {selectedDoctor.phone || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">City</p>
                  <p className="font-medium">
                    {selectedDoctor.city || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Hospital/Clinic</p>
                  <p className="font-medium">
                    {selectedDoctor.hospital || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Qualification</p>
                  <p className="font-medium">
                    {selectedDoctor.qualification || "Not provided"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Consultation Fee</p>
                  <p className="font-medium text-green-600">
                    Rs. {selectedDoctor.fee?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedDoctor.totalAppointments || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Appointments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedDoctor.totalPatients || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Patients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      Rs. {(selectedDoctor.totalEarnings || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Doctor</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDoctor(editingDoctor);
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.name}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingDoctor.email}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingDoctor.phone || ""}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={editingDoctor.specialization || ""}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={editingDoctor.experience || 0}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        experience: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (Rs.)
                  </label>
                  <input
                    type="number"
                    value={editingDoctor.fee || 0}
                    onChange={(e) =>
                      setEditingDoctor({
                        ...editingDoctor,
                        fee: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital/Clinic
                </label>
                <input
                  type="text"
                  value={editingDoctor.hospital || ""}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      hospital: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={editingDoctor.qualification || ""}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      qualification: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Helper functions for CSV export
const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] || "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default AdminDoctors;
