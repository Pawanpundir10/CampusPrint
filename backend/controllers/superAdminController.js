const User = require("../models/User");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const {
  sendShopApprovedEmail,
  sendShopRejectedEmail,
} = require("../config/mailer");

// ── Dashboard Stats ───────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalShops,
      totalOrders,
      pendingShops,
      activeShops,
      totalEarnings,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "superAdmin" } }),
      User.countDocuments({ role: "student" }),
      Shop.countDocuments(),
      Order.countDocuments(),
      Shop.countDocuments({ verificationStatus: "pending" }),
      Shop.countDocuments({ verificationStatus: "approved", isOpen: true }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      totalUsers,
      totalStudents,
      totalShopAdmins: totalUsers - totalStudents,
      totalShops,
      totalOrders,
      pendingShops,
      activeShops,
      totalEarnings: totalEarnings[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── All Users ─────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = { role: { $ne: "superAdmin" } };
    if (role) filter.role = role;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    const users = await User.find(filter)
      .select("-password -emailVerifyToken -passwordResetToken")
      .populate("shopId", "shopName verificationStatus")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Remove / Deactivate User ──────────────────────────────────────
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "superAdmin")
      return res.status(403).json({ message: "Cannot modify super admin" });
    user.isActive = !user.isActive;
    await user.save();
    // If deactivating a shop owner, also close their shop
    if (!user.isActive && user.shopId) {
      await Shop.findByIdAndUpdate(user.shopId, { isOpen: false });
    }
    res.json({
      message: `User ${user.isActive ? "reactivated" : "deactivated"}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "superAdmin")
      return res.status(403).json({ message: "Cannot delete super admin" });
    if (user.shopId) await Shop.findByIdAndDelete(user.shopId);
    await user.deleteOne();
    res.json({ message: "User deleted permanently" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── All Shops ─────────────────────────────────────────────────────
const getShops = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    const shops = await Shop.find(filter)
      .populate("ownerId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Approve Shop ──────────────────────────────────────────────────
const approveShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate("ownerId");
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    shop.verificationStatus = "approved";
    shop.isOpen = true;
    shop.verifiedAt = new Date();
    await shop.save();
    try {
      await sendShopApprovedEmail(
        shop.ownerId.email,
        shop.ownerId.name,
        shop.shopName,
      );
    } catch {}
    res.json({ message: "Shop approved!", shop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reject Shop ───────────────────────────────────────────────────
const rejectShop = async (req, res) => {
  try {
    const { reason } = req.body;
    const shop = await Shop.findById(req.params.id).populate("ownerId");
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    shop.verificationStatus = "rejected";
    shop.verificationNote = reason || "Does not meet platform requirements";
    shop.isOpen = false;
    await shop.save();
    try {
      await sendShopRejectedEmail(
        shop.ownerId.email,
        shop.ownerId.name,
        shop.shopName,
        shop.verificationNote,
      );
    } catch {}
    res.json({ message: "Shop rejected", shop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete Shop ───────────────────────────────────────────────────
const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    await User.findByIdAndUpdate(shop.ownerId, { shopId: null });
    await shop.deleteOne();
    res.json({ message: "Shop deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUser,
  deleteUser,
  getShops,
  approveShop,
  rejectShop,
  deleteShop,
};
