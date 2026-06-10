import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Stethoscope, User, Mail, Lock, Phone, MapPin, Briefcase, DollarSign, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    city: '',
    specialization: '',
    fee: '',
    qualification: '',
    experience: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Full name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Enter a valid email address (e.g., name@example.com)';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone && phone.length > 0) {
      const phoneRegex = /^03[0-9]{9}$/;
      if (!phoneRegex.test(phone)) return 'Enter valid Pakistani number (e.g., 03001234567)';
    }
    return '';
  };

  const validateCity = (city) => {
    if (!city) return 'Please select a city';
    return '';
  };

  const validateSpecialization = (specialization) => {
    if (formData.role === 'doctor' && !specialization) return 'Specialization is required for doctors';
    return '';
  };

  const validateFee = (fee) => {
    if (formData.role === 'doctor') {
      if (!fee) return 'Consultation fee is required';
      if (isNaN(fee) || Number(fee) <= 0) return 'Fee must be a positive number';
    }
    return '';
  };

  // Handle input change - FIXED: No focus loss
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate the field
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        if (!error && formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'specialization':
        error = validateSpecialization(value);
        break;
      case 'fee':
        error = validateFee(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle role change
  const handleRoleChange = (role) => {
    setFormData(prev => ({ 
      ...prev, 
      role, 
      specialization: '',
      fee: '',
      qualification: '',
      experience: ''
    }));
    setErrors(prev => ({ ...prev, specialization: '', fee: '' }));
  };

  // Validate entire form before submission
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.city = validateCity(formData.city);
    
    if (formData.role === 'doctor') {
      newErrors.specialization = validateSpecialization(formData.specialization);
      newErrors.fee = validateFee(formData.fee);
    }
    
    setErrors(newErrors);
    
    // Check if any errors exist
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    const { confirmPassword, ...submitData } = formData;
    const success = await register(submitData);
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  // Helper to check if field has error
  const hasError = (fieldName) => {
    return errors[fieldName] && errors[fieldName] !== '';
  };

  // Helper to check if field is valid
  const isValid = (fieldName) => {
    return formData[fieldName] && (!errors[fieldName] || errors[fieldName] === '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join SehatLink for quality healthcare</p>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8">
              {/* Error Summary */}
              {Object.values(errors).some(e => e && e !== '') && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 font-medium mb-2">Please fix the following errors:</p>
                  <ul className="text-red-500 text-sm space-y-1">
                    {errors.name && <li>• {errors.name}</li>}
                    {errors.email && <li>• {errors.email}</li>}
                    {errors.password && <li>• {errors.password}</li>}
                    {errors.confirmPassword && <li>• {errors.confirmPassword}</li>}
                    {errors.phone && <li>• {errors.phone}</li>}
                    {errors.city && <li>• {errors.city}</li>}
                    {errors.specialization && <li>• {errors.specialization}</li>}
                    {errors.fee && <li>• {errors.fee}</li>}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('name') ? 'border-red-500 bg-red-50' : isValid('name') ? 'border-green-500' : 'border-gray-200'
                        }`}
                        placeholder="e.g., Muhammad Ali"
                      />
                      {hasError('name') && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                      {isValid('name') && !hasError('name') && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />}
                    </div>
                    {hasError('name') && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('email') ? 'border-red-500 bg-red-50' : isValid('email') ? 'border-green-500' : 'border-gray-200'
                        }`}
                        placeholder="you@example.com"
                      />
                      {hasError('email') && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                      {isValid('email') && !hasError('email') && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />}
                    </div>
                    {hasError('email') && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('password') ? 'border-red-500 bg-red-50' : isValid('password') ? 'border-green-500' : 'border-gray-200'
                        }`}
                        placeholder="Minimum 6 characters"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {hasError('password') && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    {isValid('password') && !hasError('password') && formData.password && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12} /> Strong password!</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('confirmPassword') ? 'border-red-500 bg-red-50' : isValid('confirmPassword') ? 'border-green-500' : 'border-gray-200'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {hasError('confirmPassword') && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('patient')}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          formData.role === 'patient' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('doctor')}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          formData.role === 'doctor' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Doctor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('phone') ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder="03001234567"
                      />
                      {hasError('phone') && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                    </div>
                    {hasError('phone') && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* City */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                          hasError('city') ? 'border-red-500 bg-red-50' : isValid('city') ? 'border-green-500' : 'border-gray-200'
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
                    </div>
                    {hasError('city') && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  {/* Doctor-specific fields */}
                  {formData.role === 'doctor' && (
                    <div>
                      {/* Specialization */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialization <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                              hasError('specialization') ? 'border-red-500 bg-red-50' : isValid('specialization') ? 'border-green-500' : 'border-gray-200'
                            }`}
                            placeholder="e.g., Cardiologist"
                          />
                          {hasError('specialization') && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                          {isValid('specialization') && !hasError('specialization') && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />}
                        </div>
                        {hasError('specialization') && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                      </div>

                      {/* Fee */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (PKR) <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="number"
                            name="fee"
                            value={formData.fee}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                              hasError('fee') ? 'border-red-500 bg-red-50' : isValid('fee') ? 'border-green-500' : 'border-gray-200'
                            }`}
                            placeholder="e.g., 3000"
                          />
                          {hasError('fee') && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={18} />}
                          {isValid('fee') && !hasError('fee') && <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />}
                        </div>
                        {hasError('fee') && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
                      </div>

                      {/* Qualification */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                            placeholder="e.g., FCPS, MBBS"
                          />
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="px-6 py-4 bg-gray-50 border-t text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;