import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Send, Paperclip, Image, File, X, Smile, MoreVertical,
  Phone, Video, Info, ChevronLeft, Check, CheckCheck,
  Clock, User, Stethoscope, Calendar, Loader, Download,
  FileText, Image as ImageIcon, MessageCircle, Trash2, Search,
  Mic, ArrowLeft, Star, PhoneCall, VideoIcon, MoreHorizontal,
  CheckCircle, Clock as ClockIcon, AlertCircle, Wifi, WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Add this function right after your useState declarations
const createConversation = async (patientId, doctorId) => {
  try {
    console.log('Creating conversation with:', { patientId, doctorId });
    const response = await axios.get(`http://localhost:5000/api/chat/conversation/${patientId}/${doctorId}`);
    if (response.data.success) {
      console.log('Conversation created:', response.data.conversation);
      return response.data.conversation;
    }
    return null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Failed to create conversation');
    return null;
  }
};

  useEffect(() => {
    // Connect to socket.io
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus(true);
      if (user?.id) {
        socketRef.current.emit('userOnline', user.id);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus(false);
    });

    socketRef.current.on('userOnline', (userId) => {
      setOnlineStatus(prev => ({ ...prev, [userId]: true }));
    });

    socketRef.current.on('userOffline', (userId) => {
      setOnlineStatus(prev => ({ ...prev, [userId]: false }));
    });

    socketRef.current.on('typing', (data) => {
      if (data.senderId === selectedContact?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socketRef.current.on('newMessage', (message) => {
      if (selectedContact && message.conversationId === selectedContact.conversationId) {
        setMessages(prev => [...prev, message]);
        markMessagesAsRead(message.conversationId);
      } else {
        fetchContacts();
        // Show notification
        toast.success(`New message from ${message.senderName || 'someone'}`);
      }
    });
    
    fetchContacts();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      markMessagesAsRead(selectedContact.conversationId);
      // Emit join conversation room
      if (socketRef.current && selectedContact.conversationId) {
        socketRef.current.emit('joinConversation', selectedContact.conversationId);
      }
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'doctor') {
        response = await axios.get(`http://localhost:5000/api/chat/doctor-patients/${user.id}`);
        const patients = response.data.patients || [];
        setContacts(patients);
      } else {
        response = await axios.get(`http://localhost:5000/api/chat/patient-doctors/${user.id}`);
        const doctors = response.data.doctors || [];
        setContacts(doctors);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedContact?.conversationId) return;
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/messages/${selectedContact.conversationId}?userId=${user.id}`
      );
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await axios.put(`http://localhost:5000/api/chat/messages/read/${conversationId}`, {
        userId: user.id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (socketRef.current && selectedContact) {
      socketRef.current.emit('typing', {
        conversationId: selectedContact.conversationId,
        senderId: user.id,
        receiverId: selectedContact.id
      });
    }
  };

  const sendMessage = async () => {
  if (!messageText.trim() || !selectedContact) {
    console.log('Cannot send: no message or no contact');
    return;
  }
  
  console.log('=== SENDING MESSAGE ===');
  console.log('Selected contact:', selectedContact);
  console.log('Current user:', user);
  
  setSending(true);
  try {
    let conversationId = selectedContact.conversationId;
    
    // If no conversationId, create one NOW
    if (!conversationId) {
      console.log('No conversationId found, creating one...');
      
      let conversation;
      if (user?.role === 'doctor') {
        // Doctor sending to patient: conversation(patientId, doctorId)
        conversation = await createConversation(selectedContact.id, user.id);
      } else {
        // Patient sending to doctor: conversation(patientId, doctorId)
        conversation = await createConversation(user.id, selectedContact.id);
      }
      
      if (conversation && conversation._id) {
        conversationId = conversation._id.toString();
        // Update the contact with the new conversationId
        selectedContact.conversationId = conversationId;
        setSelectedContact({ ...selectedContact, conversationId });
        
        // Also update in contacts list
        const updatedContacts = contacts.map(c => 
          c.id === selectedContact.id ? { ...c, conversationId } : c
        );
        setContacts(updatedContacts);
        console.log('Conversation created with ID:', conversationId);
      } else {
        throw new Error('Failed to create conversation');
      }
    }
    
    // Now send the message with valid conversationId
    const messageData = {
      conversationId: conversationId,
      senderId: user.id,
      receiverId: selectedContact.id,
      message: messageText
    };
    
    console.log('Sending message data:', messageData);
    
    const response = await axios.post('http://localhost:5000/api/chat/message', messageData);
    
    if (response.data.success) {
      console.log('Message sent successfully');
      setMessages(prev => [...prev, response.data.message]);
      setMessageText('');
      
      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', response.data.message);
      }
    } else {
      throw new Error('Server returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error(error.response?.data?.message || 'Failed to send message');
  } finally {
    setSending(false);
  }
};

  const handleSelectContact = async (contact) => {
  console.log('=== SELECTING CONTACT ===');
  console.log('Contact:', contact);
  
  setLoading(true);
  try {
    let conversationId = contact.conversationId;
    
    // Create conversation if it doesn't exist
    if (!conversationId) {
      console.log('No conversationId, creating one...');
      
      let conversation;
      if (user?.role === 'doctor') {
        conversation = await createConversation(contact.id, user.id);
      } else {
        conversation = await createConversation(user.id, contact.id);
      }
      
      if (conversation && conversation._id) {
        conversationId = conversation._id.toString();
        contact.conversationId = conversationId;
        console.log('Conversation created with ID:', conversationId);
      }
    }
    
    setSelectedContact(contact);
    setShowSidebar(false);
    
    if (conversationId) {
      await fetchMessages();
      await markMessagesAsRead(conversationId);
    }
  } catch (error) {
    console.error('Error selecting contact:', error);
    toast.error('Failed to start conversation');
  } finally {
    setLoading(false);
  }
};

  const sendFile = async (file) => {
    if (!selectedContact) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', selectedContact.conversationId);
    formData.append('senderId', user.id);
    formData.append('receiverId', selectedContact.id);
    
    setUploadingFile(true);
    try {
      const response = await axios.post('http://localhost:5000/api/chat/message/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        if (socketRef.current) {
          socketRef.current.emit('sendMessage', response.data.message);
        }
        toast.success('File sent successfully');
      }
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Failed to send file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      sendFile(file);
    }
    e.target.value = '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const msgDate = new Date(date);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString();
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const sidebarVariants = {
    open: { width: 320, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { width: 0, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader className="h-12 w-12 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      {/* Connection Status Bar */}
      <AnimatePresence>
        {!connectionStatus && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm"
          >
            <WifiOff size={16} className="inline mr-2" />
            Disconnected from server. Reconnecting...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts Sidebar */}
      <motion.div
        initial="open"
        animate={showSidebar ? 'open' : 'closed'}
        variants={sidebarVariants}
        className="bg-white shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        {/* Sidebar Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Messages
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-sm mt-2"
          >
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} available
          </motion.p>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredContacts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-gray-400"
              >
                <User size={48} className="mb-2" />
                <p className="font-medium">No contacts yet</p>
                <p className="text-sm mt-1">Book an appointment to start chatting</p>
              </motion.div>
            ) : (
              filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={() => handleSelectContact(contact)}
                  className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                    selectedContact?.id === contact.id 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md"
                      >
                        <span className="text-white font-bold text-lg">
                          {contact.name?.charAt(0).toUpperCase()}
                        </span>
                      </motion.div>
                      {onlineStatus[contact.id] && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                        />
                      )}
                      {contact.unreadCount > 0 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1 shadow-md"
                        >
                          <span className="text-white text-xs font-bold">{contact.unreadCount}</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                        {contact.last_appointment && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(contact.last_appointment).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {user?.role === 'doctor' && contact.specialization && (
                        <p className="text-xs text-gray-500 mt-1">{contact.specialization}</p>
                      )}
                      {user?.role === 'patient' && contact.specialization && (
                        <p className="text-xs text-blue-600 mt-1">{contact.specialization}</p>
                      )}
                      {contact.total_appointments && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={10} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{contact.total_appointments} appointments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md"
                  >
                    <span className="text-white font-bold text-xl">
                      {selectedContact.name?.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                  {onlineStatus[selectedContact.id] && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">
                      {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
                    </p>
                    {onlineStatus[selectedContact.id] ? (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Phone size={20} className="text-gray-600" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Video size={20} className="text-gray-600" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <MoreHorizontal size={20} className="text-gray-600" />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 custom-scrollbar">
              {Object.entries(groupedMessages).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <MessageCircle size={64} className="mb-4" />
                  </motion.div>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-500 bg-gray-200/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        {date}
                      </span>
                    </div>
                    <AnimatePresence>
                      {dateMessages.map((message, idx) => (
                        <motion.div
                          key={message._id || idx}
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`max-w-[70%] ${message.senderId === user.id ? 'order-2' : 'order-1'}`}>
                            {message.hasFile ? (
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className={`rounded-2xl p-3 shadow-md ${
                                  message.senderId === user.id
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                    : 'bg-white border shadow-md'
                                }`}
                              >
                                {message.fileType?.startsWith('image/') ? (
                                  <div className="relative group">
                                    <img
                                      src={`http://localhost:5000${message.fileUrl}`}
                                      alt={message.fileName}
                                      className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition"
                                      onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
                                    />
                                    <motion.a
                                      whileHover={{ scale: 1.1 }}
                                      href={`http://localhost:5000${message.fileUrl}`}
                                      download
                                      className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                      <Download size={16} className="text-white" />
                                    </motion.a>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <FileText size={32} className={message.senderId === user.id ? 'text-white' : 'text-blue-600'} />
                                    <div>
                                      <p className="text-sm font-medium">{message.fileName}</p>
                                      <p className="text-xs opacity-75">{Math.round(message.fileSize / 1024)} KB</p>
                                    </div>
                                    <motion.a
                                      whileHover={{ scale: 1.1 }}
                                      href={`http://localhost:5000${message.fileUrl}`}
                                      download
                                      className="ml-2 p-1 hover:bg-white/20 rounded"
                                    >
                                      <Download size={18} />
                                    </motion.a>
                                  </div>
                                )}
                              </motion.div>
                            ) : (
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className={`rounded-2xl px-5 py-2.5 shadow-md ${
                                  message.senderId === user.id
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                    : 'bg-white border shadow-md text-gray-800'
                                }`}
                              >
                                <p className="text-sm break-words leading-relaxed">{message.message}</p>
                              </motion.div>
                            )}
                            <div className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${
                              message.senderId === user.id ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {message.senderId === user.id && (
                                message.isRead ? (
                                  <CheckCheck size={12} className="text-blue-500" />
                                ) : (
                                  <Check size={12} className="text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))
              )}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-md">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md border-t p-4"
            >
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  disabled={uploadingFile}
                >
                  <Paperclip size={20} className="text-gray-500" />
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <textarea
                  value={messageText}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  rows="1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={sending || !messageText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                </motion.button>
              </div>
              {uploadingFile && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500"
                >
                  <Loader size={16} className="animate-spin" />
                  Uploading file...
                </motion.div>
              )}
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="text-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <MessageCircle size={48} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Messages</h2>
              <p className="text-gray-500 text-lg">Select a contact to start chatting</p>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Chat;