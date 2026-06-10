import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Stethoscope, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        toast.error('Please login again');
        return;
      }
      
      console.log('Fetching appointments for user:', userData.id);
      
      const response = await axios.get(`http://localhost:5000/api/appointments/my?userId=${userData.id}`);
      
      console.log('Appointments response:', response.data);
      
      if (response.data.success) {
        setAppointments(response.data.appointments || []);
      } else {
        toast.error(response.data.message || 'Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {
        userId: userData.id
      });
      
      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <AlertCircle className="text-yellow-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-500 mt-1">View and manage your medical appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition whitespace-nowrap ${
                filter === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No appointments found</p>
            <p className="text-gray-400 text-sm mt-2">Book your first appointment to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt, idx) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  {/* Left - Doctor Info */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {apt.doctor_name || `Dr. ${apt.doctor_id}`}
                      </h3>
                      <p className="text-gray-500 text-sm">{apt.specialization || 'General Physician'}</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>{new Date(apt.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={14} />
                          <span>{new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin size={14} />
                          <span>{apt.doctor_city || 'Karachi'}</span>
                        </div>
                      </div>
                      {apt.symptoms && (
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Symptoms:</span> {apt.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right - Status & Actions */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(apt.status)}
                      <span className={`capitalize font-medium px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">Rs. {apt.amount}</p>
                    {apt.status === 'pending' && (
                      <button 
                        onClick={() => cancelAppointment(apt.id)}
                        className="mt-3 text-red-600 text-sm hover:underline"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;