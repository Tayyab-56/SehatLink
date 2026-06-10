import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Chat from './pages/Chat';

// Pages - Patient
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetails from './pages/DoctorDetails';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages - Doctor
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatients from './pages/DoctorPatients';
import DoctorEarnings from './pages/DoctorEarnings';
import DoctorProfile from './pages/DoctorProfile';

// Pages - Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors';
import AdminAppointments from './pages/AdminAppointments';
import MedicalChatbot from './pages/MedicalChatbot';
import FloatingAIAssistant from './components/FloatingAIAssistant';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/medical-chatbot" element={<MedicalChatbot />} />

            {/* Protected Routes (all authenticated users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<Chat />} />
            </Route>
            
            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/booking/:doctorId" element={<Booking />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-patients" element={<DoctorPatients />} />
              <Route path="/doctor-earnings" element={<DoctorEarnings />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-users" element={<AdminUsers />} />
              <Route path="/admin-doctors" element={<AdminDoctors />} />
              <Route path="/admin-appointments" element={<AdminAppointments />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <FloatingAIAssistant />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}
export default App;