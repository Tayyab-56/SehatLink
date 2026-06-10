const { Payment, Appointment, User } = require('../models/postgres');
const Notification = require('../models/mongodb/Notification');

// Create payment
const createPayment = async (req, res) => {
  try {
    const { appointmentId, method } = req.body;
    
    const appointment = await Appointment.findByPk(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const payment = await Payment.create({
      appointmentId,
      patientId: req.user.id,
      doctorId: appointment.doctorId,
      amount: appointment.amount,
      method,
      status: 'pending',
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment (simulate payment completion)
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findByPk(paymentId);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    payment.status = 'completed';
    payment.paymentDate = new Date();
    await payment.save();
    
    // Update appointment payment status
    await Appointment.update(
      { paymentStatus: 'paid', status: 'confirmed' },
      { where: { id: payment.appointmentId } }
    );
    
    // Create notification
    await Notification.create({
      userId: req.user.id,
      title: 'Payment Successful',
      message: `Payment of Rs.${payment.amount} for appointment has been completed.`,
      type: 'payment',
      relatedId: payment.id
    });
    
    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { patientId: req.user.id },
      include: [{ model: Appointment, include: ['doctor'] }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, verifyPayment, getPaymentHistory };