const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const { testConnections } = require('./db');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

app.set('io', io);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SehatLink API is running with all three databases' });
});

const userConnections = new Map();

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  let currentUserId = null;
  socket.on('userOnline', (userId) => {
    currentUserId = userId;
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} online (${userConnections.get(userId).size} active tabs)`);
    if (userConnections.get(userId).size === 1) {
      socket.broadcast.emit('userOnline', userId);
    }
  });

  socket.on('joinConversation', (conversationId) => {
    if (conversationId) {
      socket.join(`conversation_${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    }
  });

  socket.on('leaveConversation', (conversationId) => {
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });

  socket.on('typing', (data) => {
    if (data.conversationId) {
      socket.to(`conversation_${data.conversationId}`).emit('typing', data);
    }
  });

  socket.on('sendMessage', (message) => {
    console.log('📨 New message from:', message.senderId);
    if (message.conversationId) {
      io.to(`conversation_${message.conversationId}`).emit('newMessage', message);
    }
  });

  socket.on('markRead', (data) => {
    if (data.conversationId) {
      io.to(`conversation_${data.conversationId}`).emit('messagesRead', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    if (currentUserId && userConnections.has(currentUserId)) {
      userConnections.get(currentUserId).delete(socket.id);
      if (userConnections.get(currentUserId).size === 0) {
        userConnections.delete(currentUserId);
        console.log(`📤 User ${currentUserId} offline (all tabs closed)`);
        socket.broadcast.emit('userOffline', currentUserId);
      } else {
        console.log(`👥 User ${currentUserId} has ${userConnections.get(currentUserId).size} active tabs`);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnections();
  const { connectNeo4j } = require('./db');
  await connectNeo4j();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🔌 Socket.io server ready for multiple connections`);
  });
};

startServer();