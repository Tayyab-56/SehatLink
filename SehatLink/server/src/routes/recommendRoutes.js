const express = require('express');
const { getIntelligentRecommendations } = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/doctors', protect, getIntelligentRecommendations);

module.exports = router;