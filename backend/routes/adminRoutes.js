const express = require("express");
const r = express.Router();
const { getShopOrders, updateOrderStatus, markPaymentReceived, getEarnings } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
r.get("/orders", protect, adminOnly, getShopOrders);
r.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);
r.put("/orders/:id/payment", protect, adminOnly, markPaymentReceived);
r.get("/earnings", protect, adminOnly, getEarnings);
module.exports = r;
