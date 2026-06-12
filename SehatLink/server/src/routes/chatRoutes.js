const express = require('express');
const {
  upload,
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  sendFileMessage,
  getDoctorChatPatients,
  getPatientChatDoctors,
  markMessagesAsRead
} = require('../controllers/chatController');

const router = express.Router();

router.get('/doctor-patients/:doctorId', getDoctorChatPatients || ((req, res) => res.json({ success: true, patients: [] })));
router.get('/patient-doctors/:patientId', getPatientChatDoctors || ((req, res) => res.json({ success: true, doctors: [] })));

router.get('/conversations', getUserConversations || ((req, res) => res.json({ success: true, conversations: [] })));
router.get('/conversation/:patientId/:doctorId', getOrCreateConversation || ((req, res) => res.json({ success: true, conversation: null })));

router.get('/messages/:conversationId', getMessages || ((req, res) => res.json({ success: true, messages: [] })));
router.post('/message', sendMessage || ((req, res) => res.json({ success: true, message: null })));
router.post('/message/file', upload.single('file'), sendFileMessage || ((req, res) => res.json({ success: true, message: null })));
router.put('/messages/read/:conversationId', markMessagesAsRead || ((req, res) => res.json({ success: true })));

module.exports = router;