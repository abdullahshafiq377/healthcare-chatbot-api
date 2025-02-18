require('dotenv')
	.config('../../.env');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const axios = require('axios');

// Start a new conversation
exports.startConversation = async (req, res) => {
	try {
		const {title} = req.body;
		const userId = req.session.user.id;
		
		const conversation = new Conversation({user: userId, title, messages: []});
		await conversation.save();
		
		res.status(201)
		   .json(conversation);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Send a message (to new or existing conversation)
exports.sendMessage = async (req, res) => {
	try {
		const {conversationId, text} = req.body;
		const userId = req.session.user.id;
		
		let conversation = null;
		
		if (!conversationId) {
			conversation = new Conversation({user: userId, title, messages: []});
			await conversation.save();
		}
		if (conversationId) {
			conversation = await Conversation.findOne({_id: conversationId, user: userId})
			                                 .populate('messages');
		}
		
		
		if (!conversation) {
			return res.status(404)
			          .json({message: 'Conversation not found'});
		}
		
		// Save user's message
		const userMessage = new Message({conversationId, sender: 'user', text});
		await userMessage.save();
		let previousMessages = [];
		if (conversation.messages.length > 1) {
			previousMessages = conversation.messages.map(message => ({
				role: message.sender === 'bot' ? 'assistant' : 'user',
				content: message.text
			}));
		}
		previousMessages.push({
			                      role: 'user',
			                      content: text
		                      });
		console.log(previousMessages);
		
		const response = await axios.post(process.env.BOT_API_URL, {
			messages: previousMessages,
		});
		
		console.log(response?.data?.answer);
		
		conversation.messages.push(userMessage._id);
		await conversation.save();
		
		const botMessage = new Message({
			                               conversationId,
			                               sender: 'bot',
			                               text: response?.data?.answer,
		                               });
		await botMessage.save();
		conversation.messages.push(botMessage._id);
		await conversation.save();
		
		res.json({userMessage, botMessage});
	} catch (error) {
		console.log(error);
		res.status(500)
		   .json({message: 'Error processing request'});
	}
};

// Get all conversations for a user
exports.getConversations = async (req, res) => {
	try {
		const conversations = await Conversation.find({user: req.session.user.id})
		                                        .select('_id title createdAt updatedAt');
		
		res.json(conversations);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

// Get messages for a specific conversation
exports.getMessages = async (req, res) => {
	try {
		const {conversationId} = req.params;
		
		const conversation = await Conversation.findOne({_id: conversationId, user: req.session.user.id})
		                                       .populate('messages');
		
		if (!conversation) {
			return res.status(404)
			          .json({message: 'Conversation not found'});
		}
		
		res.json(conversation.messages);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.getUsersMessages = async (req, res) => {
	try {
		const {conversationId} = req.params;
		
		const conversation = await Conversation.findOne({_id: conversationId})
		                                       .populate('messages');
		
		if (!conversation) {
			return res.status(404)
			          .json({message: 'Conversation not found'});
		}
		
		res.json(conversation.messages);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};

exports.getUserConversations = async (req, res) => {
	try {
		const {userId} = req.params;
		
		const conversations = await Conversation.find({user: userId})
		                                        .select('_id title createdAt updatedAt');
		
		if (!conversations.length) {
			return res.status(404)
			          .json({message: 'No conversations found for this user'});
		}
		
		res.json(conversations);
	} catch (error) {
		res.status(500)
		   .json({message: 'Server error'});
	}
};
