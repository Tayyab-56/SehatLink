const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  searchDoctors,
  addReview,
  getDoctorByUserId,
  getDoctorPatients,
  getPatientMedicalHistory,
  getDoctorEarnings,
  getDoctorAvailableSlots
} = require('../controllers/doctorController');

const router = express.Router();

router.get('/search', searchDoctors);
router.get('/patients', getDoctorPatients);
router.get('/patients/history', getPatientMedicalHistory);
router.get('/earnings', getDoctorEarnings);
router.get('/:id/available-slots', getDoctorAvailableSlots);
router.get('/by-user/:userId', getDoctorByUserId);
router.get('/:id', getDoctorById);
router.get('/', getAllDoctors);
router.post('/:id/review', addReview);

module.exports = router;