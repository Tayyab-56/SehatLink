const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getRecentUsers, 
  getRecentAppointments,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getAllDoctors,
  getDoctorById,
  updateDoctorStatus,
  updateDoctor,
  deleteDoctor,
  getAllAppointments,
  getAppointmentById,
  getAppointmentStats,
  getAppointmentsByDateRange,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment
} = require('../controllers/adminController');

router.use((req, res, next) => {
  console.log('=== ADMIN API CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  next();
});

router.get('/stats', getDashboardStats);
router.get('/recent-users', getRecentUsers);
router.get('/recent-appointments', getRecentAppointments);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

router.get('/doctors', getAllDoctors);
router.get('/doctors/:doctorId', getDoctorById);
router.put('/doctors/:doctorId/status', updateDoctorStatus);
router.put('/doctors/:doctorId', updateDoctor);
router.delete('/doctors/:doctorId', deleteDoctor);

router.get('/appointments', getAllAppointments);
router.get('/appointments/:appointmentId', getAppointmentById);
router.get('/appointments/stats/summary', getAppointmentStats);
router.get('/appointments/range/dates', getAppointmentsByDateRange);
router.put('/appointments/:appointmentId/status', updateAppointmentStatus);
router.put('/appointments/:appointmentId', updateAppointment);
router.delete('/appointments/:appointmentId', deleteAppointment);

module.exports = router;