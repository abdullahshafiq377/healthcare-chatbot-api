const Report = require("../models/Report");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Update user details (firstName and lastName only)
exports.updateUserDetails = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        await user.save();
        res.status(200).json({ message: "User details updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin resets user password
exports.adminResetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "User password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Delete all reports submitted by the user
        await Report.deleteMany({ user: userId });

        // Delete all conversations and messages associated with the user
        await Conversation.deleteMany({ user: userId });
        await Message.deleteMany({ user: userId });

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User account and all associated data deleted permanently" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

