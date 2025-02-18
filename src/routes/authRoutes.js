const express = require("express");
const { register, login, getProfile, logout, checkSession} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", logout);
router.get('/check-session', checkSession);

module.exports = router;
