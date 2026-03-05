const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    if (!req.user.isActive)
      return res.status(403).json({ message: "Account has been deactivated" });
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

const adminOnly = (req, res, next) => {
  if (!["admin", "superAdmin"].includes(req.user?.role))
    return res.status(403).json({ message: "Admin access required" });
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student")
    return res.status(403).json({ message: "Student access required" });
  next();
};

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "superAdmin")
    return res.status(403).json({ message: "Super admin access required" });
  next();
};

module.exports = { protect, adminOnly, studentOnly, superAdminOnly };
