const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../config/mailer");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const randToken = () => crypto.randomBytes(32).toString("hex");

const SUPER_ADMIN_EMAIL = "pawanpundir191@gmail.com";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPassword = (pwd) =>
  pwd &&
  pwd.length >= 8 &&
  /[a-z]/.test(pwd) &&
  /[A-Z]/.test(pwd) &&
  /[0-9]/.test(pwd) &&
  /[^A-Za-z0-9]/.test(pwd);

// ── Register (students & shop admins only — superAdmin cannot be created here) ─
const register = async (req, res) => {
  try {
    const { name, email, password, role, collegeName, phone } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password required" });

    if (!emailRegex.test(email))
      return res
        .status(400)
        .json({ message: "Enter a valid email address" });

    if (!strongPassword(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and symbol.",
      });

    // Block anyone trying to register as superAdmin
    if (role === "superAdmin")
      return res.status(403).json({ message: "Not allowed" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const verifyToken = randToken();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "student",
      collegeName,
      phone,
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
    });

    try {
      await sendVerificationEmail(email, name, verifyToken);
      console.log("✅ Verification email sent to:", email);
    } catch (e) {
      console.error("❌ Email failed:", e.message);
      // Still allow registration even if email fails
    }

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        shopId: user.shopId,
        isEmailVerified: user.isEmailVerified,
      },
      message: "Registered! Please check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    // Extra safety: only this email can ever act as super admin
    if (user.role === "superAdmin" && user.email !== SUPER_ADMIN_EMAIL)
      return res
        .status(403)
        .json({ message: "Super admin access is restricted to platform owner." });
    if (!user.isActive)
      return res
        .status(403)
        .json({
          message: "Your account has been deactivated. Contact support.",
        });

    if (!user.isEmailVerified)
      return res.status(403).json({
        message:
          "Email not verified. Please check your inbox for the verification link.",
      });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        shopId: user.shopId,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Me ────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -emailVerifyToken -passwordResetToken")
      .populate("shopId");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Verify Email ──────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await user.save();
    try {
      await sendWelcomeEmail(user.email, user.name, user.role);
    } catch {}
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Resend Verification ───────────────────────────────────────────
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });
    user.emailVerifyToken = randToken();
    user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user.email, user.name, user.emailVerifyToken);
    res.json({ message: "Verification email sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    user.passwordResetToken = randToken();
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        user.passwordResetToken,
      );
    } catch (e) {
      console.error(e.message);
    }
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset link" });
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Change Password ───────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
};
