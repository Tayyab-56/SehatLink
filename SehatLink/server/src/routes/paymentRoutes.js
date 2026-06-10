const express = require('express');
const {
  createPayment,
  verifyPayment,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/create', createPayment);
router.put('/:paymentId/verify', verifyPayment);
router.get('/history', getPaymentHistory);

module.exports = router;