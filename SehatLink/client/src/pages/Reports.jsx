import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  X,
  Calendar,
  File,
  Image,
  FileSignature,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    reportType: "blood_test",
    description: "",
    results: "",
    file: null,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        const response = await axios.get(
          `http://localhost:5000/api/reports?patientId=${userData.id}`,
        );
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.reportType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();

    const userData = JSON.parse(localStorage.getItem("user"));
    formDataObj.append("patientId", userData.id);
    formDataObj.append("title", formData.title);
    formDataObj.append("reportType", formData.reportType);
    formDataObj.append("description", formData.description);
    if (formData.results) formDataObj.append("results", formData.results);
    if (formData.file) formDataObj.append("file", formData.file);

    try {
      await axios.post(
        "http://localhost:5000/api/reports/upload",
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success("Report uploaded successfully");
      setShowUploadModal(false);
      setFormData({
        title: "",
        reportType: "blood_test",
        description: "",
        results: "",
        file: null,
      });
      fetchReports();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://localhost:5000/api/reports/${id}`);
        toast.success("Report deleted successfully");
        fetchReports();
      } catch (error) {
        toast.error("Failed to delete report");
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf"))
      return <FileSignature className="text-red-500" size={24} />;
    if (fileType?.includes("image"))
      return <Image className="text-green-500" size={24} />;
    return <File className="text-blue-500" size={24} />;
  };

  const getReportTypeBadge = (type) => {
    const types = {
      blood_test: { label: "Blood Test", color: "bg-red-100 text-red-700" },
      xray: { label: "X-Ray", color: "bg-blue-100 text-blue-700" },
      ct_scan: { label: "CT Scan", color: "bg-purple-100 text-purple-700" },
      mri: { label: "MRI", color: "bg-green-100 text-green-700" },
      urine_test: {
        label: "Urine Test",
        color: "bg-yellow-100 text-yellow-700",
      },
      other: { label: "Other", color: "bg-gray-100 text-gray-700" },
    };
    return types[type] || types.other;
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || report.reportType === filterType;
    return matchesSearch && matchesFilter;
  });

  const reportTypes = [
    { value: "blood_test", label: "Blood Test" },
    { value: "xray", label: "X-Ray" },
    { value: "ct_scan", label: "CT Scan" },
    { value: "mri", label: "MRI" },
    { value: "urine_test", label: "Urine Test" },
    { value: "other", label: "Other" },
  ];

  // Example result formats for different test types
  const resultExamples = {
    blood_test:
      '{"hemoglobin": 14.2, "rbc": 4.8, "wbc": 7.5, "platelets": 250}',
    xray: '{"finding": "Normal chest X-ray", "impression": "No abnormalities detected"}',
    mri: '{"finding": "Mild ACL sprain", "severity": "Grade 1"}',
    ct_scan: '{"finding": "No acute intracranial abnormalities"}',
    urine_test:
      '{"protein": "Negative", "glucose": "Negative", "blood": "Negative"}',
    other: '{"notes": "Additional observations here"}',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
          <p className="text-gray-500 mt-1">
            View and manage your medical records
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition"
        >
          <Upload size={18} />
          Upload Report
        </button>
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
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="all">All Types</option>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No reports found</p>
          <p className="text-gray-400 text-sm mt-1">
            Upload your first medical report
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            <Plus size={16} />
            Upload Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report, idx) => {
            const typeBadge = getReportTypeBadge(report.reportType);
            return (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(report.fileType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {report.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {report.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex-1 text-blue-600 text-sm font-medium py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      View Details
                    </button>
                    {report.fileUrl && (
                      <a
                        href={`http://localhost:5000${report.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-gray-600 text-sm font-medium py-1.5 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">
                  Upload Medical Report
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., CBC Report - Jan 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type *
                  </label>
                  <select
                    value={formData.reportType}
                    onChange={(e) =>
                      setFormData({ ...formData, reportType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {reportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Additional notes about this report"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results (JSON format)
                  </label>
                  <textarea
                    value={formData.results}
                    onChange={(e) =>
                      setFormData({ ...formData, results: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                    placeholder={resultExamples[formData.reportType]}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Example: {resultExamples[formData.reportType]}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File (PDF or Image)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload
                        className="mx-auto text-gray-400 mb-2"
                        size={32}
                      />
                      <p className="text-gray-500 text-sm">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        PDF, PNG, JPG (Max 5MB)
                      </p>
                    </label>
                    {formData.file && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload Report"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedReport.title}
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Report Type</p>
                    <p className="font-medium text-gray-800">
                      {getReportTypeBadge(selectedReport.reportType).label}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-gray-700">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {selectedReport.results &&
                  Object.keys(selectedReport.results).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Results</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(selectedReport.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                {selectedReport.fileUrl && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">File</p>
                    <a
                      href={`http://localhost:5000${selectedReport.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download size={16} />
                      Download Report
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
