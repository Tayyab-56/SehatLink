const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversations,
    getConversation,
    newConversation,
    deleteConversation,
    testNeo4j
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// Public test route
router.get('/test-neo4j', testNeo4j);

// Protected routes
router.use(protect);

router.post('/message', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getConversation);
router.delete('/conversation/:conversationId', deleteConversation);
// Add new conversation route
router.post('/new-conversation', protect, newConversation);

module.exports = router;