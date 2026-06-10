// server/src/routes/doctorRoutes.js
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

// ============= SPECIFIC ROUTES (NO PARAMETERS) - MUST BE FIRST =============
router.get('/search', searchDoctors);
router.get('/patients', getDoctorPatients);
router.get('/patients/history', getPatientMedicalHistory);
router.get('/earnings', getDoctorEarnings);
// Make sure this route exists and is BEFORE the generic /:id route
router.get('/:id/available-slots', getDoctorAvailableSlots);

// ============= ROUTES WITH SPECIFIC PARAMETER NAMES =============
router.get('/by-user/:userId', getDoctorByUserId);

// ============= GENERIC ID ROUTE - MUST BE LAST =============
router.get('/:id', getDoctorById);
router.get('/', getAllDoctors);  // This should only return ACTIVE doctors

// ============= POST ROUTES =============
router.post('/:id/review', addReview);

module.exports = router;