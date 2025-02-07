const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true }, // Title for each conversation
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
