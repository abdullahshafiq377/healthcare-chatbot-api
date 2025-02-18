const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const deleteOldConversations = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find conversations older than 30 days
        const oldConversations = await Conversation.find({ createdAt: { $lt: thirtyDaysAgo } });

        for (const conversation of oldConversations) {
            const hasMessages = await Message.exists({ conversationId: conversation._id });

            if (!hasMessages) {
                await Conversation.findByIdAndDelete(conversation._id);
                console.log(`Deleted empty conversation: ${conversation._id}`);
            }
        }
    } catch (error) {
        console.error("Error deleting old conversations:", error);
    }
};

module.exports = { deleteOldConversations };
