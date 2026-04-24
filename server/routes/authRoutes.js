const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.get("/me", protect, getMe);

module.exports = router;
