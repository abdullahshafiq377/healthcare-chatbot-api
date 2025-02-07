const express = require('express');
const {
	startConversation, sendMessage, getConversations, getMessages, getUserConversations
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnlyMiddleware');

const router = express.Router();

router.post('/conversation', authMiddleware, startConversation);
router.post('/message', authMiddleware, sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.get('/messages/:conversationId', authMiddleware, getMessages);
router.get('/admin/:userId', authMiddleware, adminOnly, getUserConversations); // Admin: Get a user's conversations

module.exports = router;
