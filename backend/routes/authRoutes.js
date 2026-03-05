const express = require("express");
const r = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

r.post("/register", register);
r.post("/login", login);
r.get("/me", protect, getMe);
r.get("/verify-email", verifyEmail);
r.post("/resend-verification", protect, resendVerification);
r.post("/forgot-password", forgotPassword);
r.post("/reset-password", resetPassword);
r.post("/change-password", protect, changePassword);

module.exports = r;
