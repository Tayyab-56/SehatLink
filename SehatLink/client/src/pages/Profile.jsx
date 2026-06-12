import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Edit2,
  Save,
  X,
  Camera,
  Award,
  Clock,
  FileText,
  Stethoscope,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  XCircle,
  DollarSign,
  Upload,
  Loader,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    bloodGroup: "",
    allergies: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: "",
    avatar: "",
  });
  const [stats, setStats] = useState({
    appointments: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
    memberSince: "",
  });

  // ==================== VALIDATION FUNCTIONS ====================

  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (name.length > 100) return "Name must be less than 100 characters";
    if (!/^[a-zA-Z\s]+$/.test(name))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validatePhone = (phone) => {
    if (phone && phone.length > 0) {
      if (!/^03[0-9]{9}$/.test(phone)) {
        return "Enter valid Pakistani number (e.g., 03001234567)";
      }
    }
    return "";
  };

  const validateCity = (city) => {
    const validCities = [
      "Karachi",
      "Lahore",
      "Islamabad",
      "Rawalpindi",
      "Faisalabad",
      "Multan",
      "Peshawar",
      "Quetta",
    ];
    if (city && !validCities.includes(city)) {
      return "Please select a valid city";
    }
    return "";
  };

  const validateBloodGroup = (bloodGroup) => {
    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (bloodGroup && !validGroups.includes(bloodGroup)) {
      return "Please select a valid blood group";
    }
    return "";
  };

  const validateDateOfBirth = (dob) => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 0) return "Date of birth cannot be in the future";
      if (age > 120) return "Age cannot be more than 120 years";
      if (age < 18) return "You must be at least 18 years old";
    }
    return "";
  };

  const validateEmergencyPhone = (phone) => {
    if (phone && phone.length > 0) {
      if (!/^03[0-9]{9}$/.test(phone)) {
        return "Enter valid Pakistani number (e.g., 03001234567)";
      }
    }
    return "";
  };

  const validateEmergencyContact = (name) => {
    if (name && name.length < 2) {
      return "Emergency contact name must be at least 2 characters";
    }
    return "";
  };

  const validateAllergies = (allergies) => {
    if (allergies && allergies.length > 500) {
      return "Allergies description too long (max 500 characters)";
    }
    return "";
  };

  // Real-time validation on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });

    // Real-time validation
    let error = "";
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "city":
        error = validateCity(value);
        break;
      case "bloodGroup":
        error = validateBloodGroup(value);
        break;
      case "dateOfBirth":
        error = validateDateOfBirth(value);
        break;
      case "emergencyPhone":
        error = validateEmergencyPhone(value);
        break;
      case "emergencyContact":
        error = validateEmergencyContact(value);
        break;
      case "allergies":
        error = validateAllergies(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    let error = "";
    switch (name) {
      case "name":
        error = validateName(profileData.name);
        break;
      case "phone":
        error = validatePhone(profileData.phone);
        break;
      case "city":
        error = validateCity(profileData.city);
        break;
      case "bloodGroup":
        error = validateBloodGroup(profileData.bloodGroup);
        break;
      case "dateOfBirth":
        error = validateDateOfBirth(profileData.dateOfBirth);
        break;
      case "emergencyPhone":
        error = validateEmergencyPhone(profileData.emergencyPhone);
        break;
      case "emergencyContact":
        error = validateEmergencyContact(profileData.emergencyContact);
        break;
      case "allergies":
        error = validateAllergies(profileData.allergies);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.name = validateName(profileData.name);
    newErrors.phone = validatePhone(profileData.phone);
    newErrors.city = validateCity(profileData.city);
    newErrors.bloodGroup = validateBloodGroup(profileData.bloodGroup);
    newErrors.dateOfBirth = validateDateOfBirth(profileData.dateOfBirth);
    newErrors.emergencyPhone = validateEmergencyPhone(
      profileData.emergencyPhone,
    );
    newErrors.emergencyContact = validateEmergencyContact(
      profileData.emergencyContact,
    );
    newErrors.allergies = validateAllergies(profileData.allergies);

    setErrors(newErrors);

    // Check if any errors exist
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      await axios.put(
        `http://localhost:5000/api/auth/profile/${userData.id}`,
        profileData,
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);

      const updatedUser = { ...userData, ...profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if field has error
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] && errors[fieldName] !== "";
  };

  // Helper to check if field is valid
  const isValid = (fieldName) => {
    return (
      touched[fieldName] &&
      profileData[fieldName] &&
      (!errors[fieldName] || errors[fieldName] === "")
    );
  };

  useEffect(() => {
    fetchCompleteProfile();
    fetchUserStats();
  }, []);

  const fetchCompleteProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.id) {
        const response = await axios.get(
          `http://localhost:5000/api/auth/complete-profile/${userData.id}`,
        );

        if (response.data.success) {
          const userData = response.data.user;

          // Format the memberSince date
          const formattedMemberSince = userData.memberSince
            ? new Date(userData.memberSince).toLocaleDateString("en-PK", {
                year: "numeric",
                month: "long",
              })
            : "January 2024";

          setProfileData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            city: userData.city || "",
            bloodGroup: userData.bloodGroup || "",
            allergies: userData.allergies || "",
            dateOfBirth: userData.dateOfBirth || "",
            emergencyContact: userData.emergencyContact || "",
            emergencyPhone: userData.emergencyPhone || "",
            avatar: userData.avatar || "",
          });

          setStats((prev) => ({
            ...prev,
            memberSince: formattedMemberSince,
          }));

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          if (updateUser) updateUser(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching complete profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const fetchUserStats = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        const response = await axios.get(
          `http://localhost:5000/api/appointments/my?userId=${userData.id}`,
        );
        const appointments = response.data.appointments || [];

        setStats({
          appointments: appointments.length,
          completed: appointments.filter((a) => a.status === "completed")
            .length,
          cancelled: appointments.filter((a) => a.status === "cancelled")
            .length,
          totalSpent: appointments.reduce((sum, a) => sum + (a.amount || 0), 0),
          memberSince: new Date(
            userData.createdAt || Date.now(),
          ).toLocaleDateString("en-PK", { year: "numeric", month: "long" }),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    const formData = new FormData();
    const userData = JSON.parse(localStorage.getItem("user"));
    formData.append("avatar", file);
    formData.append("userId", userData.id);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/upload-avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        toast.success("Profile picture updated successfully");
        const updatedUser = { ...userData, avatar: response.data.avatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfileData({ ...profileData, avatar: response.data.avatarUrl });
        if (updateUser) updateUser(updatedUser);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.appointments,
      icon: Calendar,
      color: "blue",
      change: "+12%",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "green",
      change: "+8%",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "red",
      change: "-2%",
    },
    {
      title: "Total Spent",
      value: `Rs. ${stats.totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
      change: "+15%",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information and health data
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/30 transition disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader size={18} className="animate-spin text-white" />
                  ) : (
                    <Camera size={18} className="text-white" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Avatar */}
              <div className="relative px-6 pb-6">
                <div className="absolute -top-12 left-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
                  >
                    {profileData.avatar ? (
                      <img
                        src={`http://localhost:5000${profileData.avatar}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {user?.name?.charAt(0)}
                      </span>
                    )}
                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={20} className="text-white" />
                    </div>
                  </motion.div>
                </div>
                <div className="pt-14 text-right">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-auto"
                  >
                    {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>
                <div className="mt-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {profileData.name}
                  </h2>
                  <p className="text-gray-500 text-sm capitalize">
                    {user?.role}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />

                    <span className="text-sm text-gray-600">
                      Member since {stats.memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="border-t px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm">
                    {profileData.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm">
                    {profileData.city || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm">Joined {stats.memberSince}</span>
                </div>
              </div>

              {/* Health Stats */}
              <div className="bg-gray-50 p-6 rounded-b-2xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-red-500" />
                  Health Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="font-medium">
                      {profileData.bloodGroup || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Allergies</span>
                    <span className="font-medium">
                      {profileData.allergies || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Emergency Contact</span>
                    <span className="font-medium">
                      {profileData.emergencyContact || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Edit Form & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {statCards.map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-800">
                        {stat.value}
                      </p>
                      <p className="text-green-600 text-xs">{stat.change}</p>
                    </div>
                    <div
                      className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon
                        size={16}
                        className={`text-${stat.color}-600`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Edit Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Personal Information
              </h2>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Summary */}
                  {Object.values(errors).some((e) => e && e !== "") && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium mb-1">
                        Please fix the following errors:
                      </p>
                      <ul className="text-red-500 text-xs space-y-1">
                        {errors.name && <li>• {errors.name}</li>}
                        {errors.phone && <li>• {errors.phone}</li>}
                        {errors.city && <li>• {errors.city}</li>}
                        {errors.bloodGroup && <li>• {errors.bloodGroup}</li>}
                        {errors.dateOfBirth && <li>• {errors.dateOfBirth}</li>}
                        {errors.emergencyPhone && (
                          <li>• {errors.emergencyPhone}</li>
                        )}
                        {errors.emergencyContact && (
                          <li>• {errors.emergencyContact}</li>
                        )}
                        {errors.allergies && <li>• {errors.allergies}</li>}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                          hasError("name")
                            ? "border-red-500 bg-red-50"
                            : isValid("name")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      />
                      {hasError("name") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email - Disabled */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="03001234567"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                          hasError("phone")
                            ? "border-red-500 bg-red-50"
                            : isValid("phone")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      />
                      {hasError("phone") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* City Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        name="city"
                        value={profileData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                          hasError("city")
                            ? "border-red-500 bg-red-50"
                            : isValid("city")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      >
                        <option value="">Select City</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                      </select>
                      {hasError("city") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={profileData.bloodGroup}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                          hasError("bloodGroup")
                            ? "border-red-500 bg-red-50"
                            : isValid("bloodGroup")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      {hasError("bloodGroup") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.bloodGroup}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                          hasError("dateOfBirth")
                            ? "border-red-500 bg-red-50"
                            : isValid("dateOfBirth")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      />
                      {hasError("dateOfBirth") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Emergency Contact Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={profileData.emergencyContact}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., Muhammad Ali"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                          hasError("emergencyContact")
                            ? "border-red-500 bg-red-50"
                            : isValid("emergencyContact")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      />
                      {hasError("emergencyContact") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.emergencyContact}
                        </p>
                      )}
                    </div>

                    {/* Emergency Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={profileData.emergencyPhone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 03001234567"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                          hasError("emergencyPhone")
                            ? "border-red-500 bg-red-50"
                            : isValid("emergencyPhone")
                              ? "border-green-500"
                              : "border-gray-200"
                        }`}
                      />
                      {hasError("emergencyPhone") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.emergencyPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={profileData.allergies}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="3"
                      placeholder="List any allergies (e.g., Penicillin, Dust, etc.)"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        hasError("allergies")
                          ? "border-red-500 bg-red-50"
                          : isValid("allergies")
                            ? "border-green-500"
                            : "border-gray-200"
                      }`}
                    />
                    {hasError("allergies") && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.allergies}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-gray-800">
                      {profileData.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-gray-800">
                      {profileData.city || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Blood Group</p>
                    <p className="text-gray-800">
                      {profileData.bloodGroup || "Not specified"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Allergies</p>
                    <p className="text-gray-800">
                      {profileData.allergies || "None"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-gray-800">
                      {profileData.dateOfBirth || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Emergency Contact</p>
                    <p className="text-gray-800">
                      {profileData.emergencyContact || "Not set"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-green-600" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Last login: Today at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Profile;
