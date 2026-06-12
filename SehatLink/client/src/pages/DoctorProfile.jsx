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
  Briefcase,
  GraduationCap,
  Hospital,
  Clock as ClockIcon,
  Users,
  Wallet,
  Star as StarIcon,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const DoctorProfile = () => {
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
    specialization: "",
    qualification: "",
    experience: "",
    fee: "",
    hospital: "",
    avatar: "",
  });
  const [stats, setStats] = useState({
    totalPatients: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    memberSince: "",
  });

  // Validation Functions
  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
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

  const validateSpecialization = (value) => {
    if (!value) return "Specialization is required";
    return "";
  };

  const validateQualification = (value) => {
    if (!value) return "Qualification is required";
    return "";
  };

  const validateExperience = (value) => {
    if (!value) return "Experience is required";
    if (isNaN(value) || value < 0)
      return "Experience must be a positive number";
    if (value > 60) return "Experience cannot exceed 60 years";
    return "";
  };

  const validateFee = (value) => {
    if (!value) return "Consultation fee is required";
    if (isNaN(value) || value < 500) return "Fee must be at least Rs. 500";
    if (value > 50000) return "Fee cannot exceed Rs. 50,000";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });

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
      case "specialization":
        error = validateSpecialization(value);
        break;
      case "qualification":
        error = validateQualification(value);
        break;
      case "experience":
        error = validateExperience(value);
        break;
      case "fee":
        error = validateFee(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

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
      case "specialization":
        error = validateSpecialization(profileData.specialization);
        break;
      case "qualification":
        error = validateQualification(profileData.qualification);
        break;
      case "experience":
        error = validateExperience(profileData.experience);
        break;
      case "fee":
        error = validateFee(profileData.fee);
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
    newErrors.specialization = validateSpecialization(
      profileData.specialization,
    );
    newErrors.qualification = validateQualification(profileData.qualification);
    newErrors.experience = validateExperience(profileData.experience);
    newErrors.fee = validateFee(profileData.fee);

    setErrors(newErrors);
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
        `http://localhost:5000/api/auth/doctor-profile/${userData.id}`,
        profileData,
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);

      const updatedUser = { ...userData, ...profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);
      fetchDoctorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const hasError = (fieldName) => touched[fieldName] && errors[fieldName];
  const isValid = (fieldName) =>
    touched[fieldName] && profileData[fieldName] && !errors[fieldName];

  const fetchDoctorProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.id) {
        const response = await axios.get(
          `http://localhost:5000/api/auth/doctor-complete-profile/${userData.id}`,
        );

        if (response.data.success) {
          const userData = response.data.user;
          setProfileData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            city: userData.city || "",
            specialization: userData.specialization || "",
            qualification: userData.qualification || "",
            experience: userData.experience || "",
            fee: userData.fee || "",
            hospital: userData.hospital || "",
            consultationDuration: userData.consultationDuration || "30",
            avatar: userData.avatar || "",
          });

          setStats({
            totalPatients: userData.totalPatients || 0,
            completedAppointments: userData.completedAppointments || 0,
            pendingAppointments: userData.pendingAppointments || 0,
            totalEarnings: userData.totalEarnings || 0,
            rating: userData.rating || 0,
            memberSince: userData.memberSince || "January 2024",
          });

          localStorage.setItem("user", JSON.stringify(userData));
          if (updateUser) updateUser(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      toast.error("Failed to load profile data");
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

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const statsCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "blue",
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: stats.pendingAppointments,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Total Earnings",
      value: `Rs. ${stats.totalEarnings.toLocaleString()}`,
      icon: Wallet,
      color: "purple",
    },
    { title: "Rating", value: stats.rating, icon: StarIcon, color: "orange" },
  ];

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your professional information and practice details
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-24">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/30 transition"
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
                    Dr. {profileData.name}
                  </h2>
                  <p className="text-blue-600 font-medium">
                    {profileData.specialization}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-sm text-gray-600">
                      {stats.rating} Rating
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      Member since {stats.memberSince}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={16} />
                  <span className="text-sm">
                    {profileData.phone || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">
                    {profileData.city || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Hospital size={16} />
                  <span className="text-sm">
                    {profileData.hospital || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-b-2xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Stethoscope size={16} className="text-blue-500" />
                  Practice Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">
                      {profileData.experience} years
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-medium text-green-600">
                      Rs. {profileData.fee}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Qualification</span>
                    <span className="font-medium">
                      {profileData.qualification}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Consultation Duration</span>
                    <span className="font-medium">
                      {profileData.consultationDuration} mins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statsCards.map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-800">
                        {stat.value}
                      </p>
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
            </div>

            {/* Edit Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Professional Information
              </h2>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {Object.values(errors).some((e) => e) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium mb-1">
                        Please fix the following errors:
                      </p>
                      <ul className="text-red-500 text-xs space-y-1">
                        {errors.name && <li>• {errors.name}</li>}
                        {errors.phone && <li>• {errors.phone}</li>}
                        {errors.city && <li>• {errors.city}</li>}
                        {errors.specialization && (
                          <li>• {errors.specialization}</li>
                        )}
                        {errors.qualification && (
                          <li>• {errors.qualification}</li>
                        )}
                        {errors.experience && <li>• {errors.experience}</li>}
                        {errors.fee && <li>• {errors.fee}</li>}
                      </ul>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("name") ? "border-red-500 bg-red-50" : isValid("name") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("name") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="03001234567"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("phone") ? "border-red-500 bg-red-50" : isValid("phone") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("phone") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        name="city"
                        value={profileData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("city") ? "border-red-500 bg-red-50" : isValid("city") ? "border-green-500" : "border-gray-200"}`}
                      >
                        <option value="">Select City</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                      </select>
                      {hasError("city") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization *
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("specialization") ? "border-red-500 bg-red-50" : isValid("specialization") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("specialization") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.specialization}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={profileData.qualification}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="MBBS, FCPS"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("qualification") ? "border-red-500 bg-red-50" : isValid("qualification") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("qualification") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.qualification}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (years) *
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={profileData.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("experience") ? "border-red-500 bg-red-50" : isValid("experience") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("experience") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.experience}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Fee (PKR) *
                      </label>
                      <input
                        type="number"
                        name="fee"
                        value={profileData.fee}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${hasError("fee") ? "border-red-500 bg-red-50" : isValid("fee") ? "border-green-500" : "border-gray-200"}`}
                      />
                      {hasError("fee") && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fee}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital/Clinic
                      </label>
                      <input
                        type="text"
                        name="hospital"
                        value={profileData.hospital}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Duration (minutes)
                      </label>
                      <select
                        name="consultationDuration"
                        value={profileData.consultationDuration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={18} />{" "}
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
                    <p className="text-xs text-gray-500">Phone</p>
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
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-gray-800 font-medium">
                      {profileData.specialization}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="text-gray-800">{profileData.qualification}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-gray-800">
                      {profileData.experience} years
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Consultation Fee</p>
                    <p className="text-gray-800 font-semibold text-green-600">
                      Rs. {profileData.fee}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Hospital/Clinic</p>
                    <p className="text-gray-800">
                      {profileData.hospital || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      Consultation Duration
                    </p>
                    <p className="text-gray-800">
                      {profileData.consultationDuration} minutes
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-green-600" />
                Practice Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Total Patients Treated: {stats.totalPatients}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Completed Appointments: {stats.completedAppointments}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Pending Appointments: {stats.pendingAppointments}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default DoctorProfile;
