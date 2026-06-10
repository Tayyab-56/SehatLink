import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, Clock, Stethoscope, DollarSign, MapPin, ArrowLeft, Loader, AlertCircle } from 'lucide-react';

const Booking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (date && doctorId) {
      fetchAvailableSlots();
    }
  }, [date, doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doctors/${doctorId}`);
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };
  const fetchAvailableSlots = async () => {
  if (!date) return;
  
  setLoadingSlots(true);
  setTime('');
  setAvailableSlots([]);
  
  try {
    const url = `http://localhost:5000/api/doctors/${doctorId}/available-slots?date=${date}`;
    console.log('Fetching slots from:', url);
    
    const response = await axios.get(url);
    console.log('Slots response:', response.data);
    
    if (response.data.success) {
      const slots = response.data.slots || [];
      setAvailableSlots(slots);
      if (slots.length === 0) {
        toast('No available slots for this date. Please select another date.');
      }
    } else {
      toast.error(response.data.message || 'Failed to load slots');
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    toast.error('Failed to load available time slots');
  } finally {
    setLoadingSlots(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast.error('Please select date and time');
      return;
    }
    
    const appointmentDate = new Date(`${date}T${time}`);
    
    if (appointmentDate <= new Date()) {
      toast.error('Please select a future date and time');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/appointments', {
        doctorId: parseInt(doctorId),
        appointmentDate: appointmentDate.toISOString(),
        symptoms,
        patientId: userData.id
      });
      
      if (response.data.success) {
        toast.success('Appointment booked successfully!');
        navigate('/appointments');
      } else {
        toast.error(response.data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {doctor.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{doctor.name}</h2>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Stethoscope size={18} />
                <span>{doctor.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} />
                <span>{doctor.city}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign size={18} />
                <span>Rs. {doctor.fee} per consultation</span>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Book Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    min={minDateStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Time Selection - Shows only doctor's available slots */}
              {date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                    {loadingSlots && <Loader size={14} className="inline ml-2 animate-spin" />}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                      disabled={loadingSlots || availableSlots.length === 0}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select time slot</option>
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  {!loadingSlots && availableSlots.length === 0 && date && (
                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      No available slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              )}

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (Optional)</label>
                <textarea
                  rows="4"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Describe your symptoms..."
                />
              </div>

              {/* Appointment Summary */}
              {date && time && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Appointment Summary:</p>
                  <p className="font-medium text-gray-800">
                    {new Date(`${date}T${time}`).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Fee: <span className="font-semibold text-blue-600">Rs. {doctor.fee}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !date || !time || availableSlots.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Booking...' : `Confirm Booking - Rs. ${doctor.fee}`}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Booking;