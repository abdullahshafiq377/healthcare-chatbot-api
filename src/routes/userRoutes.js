const express = require('express');
const {updateUserDetails, updatePassword, adminResetUserPassword, deleteAccount} = require(
	'../controllers/userController');
const authMiddleware = require('../middleware/authmiddleware');
const adminOnly = require('../middleware/adminOnlyMiddleware');

const router = express.Router();

router.put('/update', authMiddleware, updateUserDetails); // Update firstName & lastName
router.put('/password', authMiddleware, updatePassword); // Update password
router.put('/reset-password/:userId', authMiddleware, adminOnly, adminResetUserPassword); // Admin resets user password
router.delete('/delete', authMiddleware, deleteAccount); // Delete user account permanently

module.exports = router;
