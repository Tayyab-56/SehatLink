// server/src/controllers/chatController.js
const { getMongoDB } = require('../db');
const { ObjectId } = require('mongodb');
const { pgQuery } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/chats');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter 
});

// ==================== CONVERSATION FUNCTIONS ====================

// Get or create conversation between patient and doctor
const getOrCreateConversation = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;
    
    console.log('Creating/getting conversation - patientId:', patientId, 'doctorId:', doctorId);
    
    const mongoDb = getMongoDB();
    
    // Check if conversation exists
    let conversation = await mongoDb.collection('conversations').findOne({
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId)
    });
    
    if (!conversation) {
      // Get patient and doctor names
      const patientResult = await pgQuery(`SELECT name FROM users WHERE id = $1`, [parseInt(patientId)]);
      const doctorResult = await pgQuery(`SELECT name FROM users WHERE id = $1`, [parseInt(doctorId)]);
      
      const newConversation = {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        patientName: patientResult.rows[0]?.name || 'Patient',
        doctorName: doctorResult.rows[0]?.name || 'Doctor',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessage: null,
        lastMessageTime: null
      };
      
      const result = await mongoDb.collection('conversations').insertOne(newConversation);
      conversation = { ...newConversation, _id: result.insertedId };
      console.log('Created new conversation:', conversation._id);
    } else {
      console.log('Found existing conversation:', conversation._id);
    }
    
    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    const mongoDb = getMongoDB();
    
    let conversations;
    
    if (role === 'patient') {
      conversations = await mongoDb.collection('conversations')
        .find({ patientId: parseInt(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
    } else {
      conversations = await mongoDb.collection('conversations')
        .find({ doctorId: parseInt(userId) })
        .sort({ updatedAt: -1 })
        .toArray();
    }
    
    // Get unread count for each conversation
    for (const conv of conversations) {
      const unreadCount = await mongoDb.collection('messages').countDocuments({
        conversationId: conv._id.toString(),
        receiverId: parseInt(userId),
        isRead: false
      });
      conv.unreadCount = unreadCount;
    }
    
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;
    
    const mongoDb = getMongoDB();
    
    const messages = await mongoDb.collection('messages')
      .find({ conversationId: conversationId })
      .sort({ createdAt: 1 })
      .toArray();
    
    // Mark messages as read
    if (userId) {
      await mongoDb.collection('messages').updateMany(
        { conversationId: conversationId, receiverId: parseInt(userId), isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, receiverId, message } = req.body;
    
    console.log('📨 Send message request:', { conversationId, senderId, receiverId, message });
    
    if (!conversationId || !senderId || !receiverId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const mongoDb = getMongoDB();
    
    // Verify conversation exists
    let conversation;
    try {
      conversation = await mongoDb.collection('conversations').findOne({
        _id: new ObjectId(conversationId)
      });
    } catch (err) {
      conversation = await mongoDb.collection('conversations').findOne({
        _id: conversationId
      });
    }
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conversation not found' 
      });
    }
    
    // Get sender name
    const senderResult = await pgQuery(`SELECT name FROM users WHERE id = $1`, [parseInt(senderId)]);
    const senderName = senderResult.rows[0]?.name || 'User';
    
    const newMessage = {
      conversationId: conversationId,
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      message: message,
      isRead: false,
      hasFile: false,
      senderName: senderName,
      createdAt: new Date()
    };
    
    const result = await mongoDb.collection('messages').insertOne(newMessage);
    console.log('✅ Message inserted with ID:', result.insertedId);
    
    // Update conversation last message
    await mongoDb.collection('conversations').updateOne(
      { _id: conversation._id },
      { 
        $set: { 
          lastMessage: message.substring(0, 50),
          lastMessageTime: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    const finalMessage = { ...newMessage, _id: result.insertedId };
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('newMessage', finalMessage);
      io.to(`user_${receiverId}`).emit('newMessage', finalMessage);
    }
    
    res.status(201).json({ 
      success: true, 
      message: finalMessage
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send file message
const sendFileMessage = async (req, res) => {
  try {
    const { conversationId, senderId, receiverId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const mongoDb = getMongoDB();
    
    const fileUrl = `/uploads/chats/${req.file.filename}`;
    const fileType = req.file.mimetype;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    
    const newMessage = {
      conversationId: conversationId,
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      message: `📎 ${fileName}`,
      isRead: false,
      hasFile: true,
      fileUrl: fileUrl,
      fileType: fileType,
      fileName: fileName,
      fileSize: fileSize,
      createdAt: new Date()
    };
    
    const result = await mongoDb.collection('messages').insertOne(newMessage);
    
    await mongoDb.collection('conversations').updateOne(
      { _id: new ObjectId(conversationId) },
      { 
        $set: { 
          lastMessage: `📎 ${fileName}`,
          lastMessageTime: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('newMessage', newMessage);
    }
    
    res.status(201).json({ 
      success: true, 
      message: { ...newMessage, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Send file error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patients that doctor can chat with
const getDoctorChatPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log('Received doctorId:', doctorId);
    
    let dbDoctorId;
    const doctorResult = await pgQuery(`SELECT id FROM doctors WHERE user_id = $1`, [parseInt(doctorId)]);
    
    if (doctorResult.rows.length > 0) {
      dbDoctorId = doctorResult.rows[0].id;
    } else {
      const directDoctor = await pgQuery(`SELECT id FROM doctors WHERE id = $1`, [parseInt(doctorId)]);
      if (directDoctor.rows.length > 0) {
        dbDoctorId = parseInt(doctorId);
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'Doctor not found' 
        });
      }
    }
    
    const patients = await pgQuery(
      `SELECT DISTINCT 
         u.id, u.name, u.email, u.phone, u.avatar,
         MAX(a.appointment_date) as last_appointment,
         COUNT(a.id) as total_appointments
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1 AND a.status IN ('pending', 'confirmed', 'completed')
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar
       ORDER BY last_appointment DESC`,
      [dbDoctorId]
    );
    
    const mongoDb = getMongoDB();
    
    for (const patient of patients.rows) {
      const conversation = await mongoDb.collection('conversations').findOne({
        patientId: patient.id,
        doctorId: parseInt(doctorId)
      });
      
      if (conversation) {
        const unreadCount = await mongoDb.collection('messages').countDocuments({
          conversationId: conversation._id.toString(),
          receiverId: parseInt(doctorId),
          isRead: false
        });
        patient.unreadCount = unreadCount;
        patient.conversationId = conversation._id.toString();
      } else {
        patient.unreadCount = 0;
        patient.conversationId = null;
      }
    }
    
    res.json({ success: true, patients: patients.rows });
  } catch (error) {
    console.error('Get doctor chat patients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get doctors that patient can chat with
const getPatientChatDoctors = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patientUserId = parseInt(patientId);
    
    const doctors = await pgQuery(
      `SELECT DISTINCT 
         u.id, u.name, u.email, u.phone, u.avatar,
         d.specialization,
         MAX(a.appointment_date) as last_appointment,
         COUNT(a.id) as total_appointments
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = $1 AND a.status IN ('pending', 'confirmed', 'completed')
       GROUP BY u.id, u.name, u.email, u.phone, u.avatar, d.specialization
       ORDER BY last_appointment DESC`,
      [patientUserId]
    );
    
    const mongoDb = getMongoDB();
    
    for (const doctor of doctors.rows) {
      const doctorUserId = doctor.id;
      
      const conversation = await mongoDb.collection('conversations').findOne({
        patientId: patientUserId,
        doctorId: doctorUserId
      });
      
      if (conversation) {
        const unreadCount = await mongoDb.collection('messages').countDocuments({
          conversationId: conversation._id.toString(),
          receiverId: patientUserId,
          isRead: false
        });
        doctor.unreadCount = unreadCount;
        doctor.conversationId = conversation._id.toString();
      } else {
        doctor.unreadCount = 0;
        doctor.conversationId = null;
      }
    }
    
    res.json({ success: true, doctors: doctors.rows });
  } catch (error) {
    console.error('Get patient chat doctors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    const mongoDb = getMongoDB();
    
    const result = await mongoDb.collection('messages').updateMany(
      { conversationId: conversationId, receiverId: parseInt(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  upload,
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  sendFileMessage,
  getDoctorChatPatients,
  getPatientChatDoctors,
  markMessagesAsRead
};