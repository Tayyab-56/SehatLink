const express = require('express');
const {
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  getActiveDoctors, 
  getActiveDoctorById
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/my', getMyAppointments);
router.get('/doctors/active', getActiveDoctors);
router.get('/doctors/active/:id', getActiveDoctorById);
router.post('/', bookAppointment);
router.put('/:id/cancel', cancelAppointment);
router.get('/doctor', getDoctorAppointments);

router.get('/:id', getAppointmentById);

router.put('/:id/status', updateAppointmentStatus);

module.exports = router;