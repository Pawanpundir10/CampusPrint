const express = require("express");
const r = express.Router();
const {
  getShops,
  getColleges,
  getShopById,
  createShop,
  updateShop,
  getMyShop,
  verifyShop,
} = require("../controllers/shopController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

r.get("/", getShops);
r.get("/colleges", getColleges);
r.get("/my", protect, adminOnly, getMyShop);
r.get("/verify/:id", verifyShop); // platform admin clicks from email
r.get("/:id", getShopById);
r.post("/", protect, adminOnly, createShop);
r.put("/:id", protect, adminOnly, updateShop);

module.exports = r;
