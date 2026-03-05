const express = require("express");
const r = express.Router();
const supabase = require("../config/supabase");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  uploadFiles,
} = require("../controllers/orderController");
const { protect, studentOnly } = require("../middleware/authMiddleware");

// Multer configuration for file upload (memory storage)
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  },
});

// PDF proxy route — fetches from Supabase with correct headers
r.get("/pdf/:filePath(*)", async (req, res) => {
  try {
    // Accept token from Authorization header OR ?token= query param
    // (query param needed when opening in a new browser tab)
    const token =
      req.query.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    let user;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select("-password");
    } catch {
      return res.status(401).json({ message: "Token invalid" });
    }
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account deactivated" });

    const filePath = req.params.filePath;

    // Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from("orders")
      .download(filePath);

    if (error) {
      console.error("Supabase download error:", error);
      return res.status(500).json({ message: "Failed to load PDF" });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.send(buffer);
  } catch (err) {
    console.error("PDF serving error:", err.message);
    res.status(500).json({ message: "Failed to load PDF" });
  }
});

// Helper to wrap multer so its errors return JSON (not HTML)
const uploadMiddleware = (req, res, next) => {
  upload.array("pdfs", 10)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE")
        return res.status(400).json({ message: "File too large. Maximum size is 20MB per file." });
      return res.status(400).json({ message: err.message || "File upload error" });
    }
    next();
  });
};

r.post(
  "/upload-files",
  protect,
  studentOnly,
  uploadMiddleware,
  uploadFiles,
);
r.post("/", protect, studentOnly, createOrder);
r.get("/my", protect, studentOnly, getMyOrders);
r.get("/:id", protect, getOrderById);
r.post("/:id/cancel", protect, studentOnly, cancelOrder);

module.exports = r;
