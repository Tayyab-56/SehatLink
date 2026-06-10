const express = require('express');
const {
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  getActiveDoctors,      // Add this
  getActiveDoctorById    // Add this
} = require('../controllers/appointmentController');

const router = express.Router();

// ==================== PATIENT ROUTES ====================
// Get patient's own appointments
router.get('/my', getMyAppointments);

// Get list of active doctors for booking (ONLY active doctors)
router.get('/doctors/active', getActiveDoctors);

// Get single active doctor by ID
router.get('/doctors/active/:id', getActiveDoctorById);

// Book an appointment (automatically checks if doctor is active)
router.post('/', bookAppointment);

// Cancel an appointment
router.put('/:id/cancel', cancelAppointment);

// ==================== DOCTOR ROUTES ====================
// Get doctor's appointments (requires authentication)
router.get('/doctor', getDoctorAppointments);

// Get appointment by ID (for viewing details)
router.get('/:id', getAppointmentById);

// Update appointment status (confirm/cancel/complete)
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;