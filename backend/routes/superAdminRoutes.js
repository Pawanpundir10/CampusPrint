const express = require("express");
const r = express.Router();
const {
  getStats,
  getUsers,
  toggleUser,
  deleteUser,
  getShops,
  approveShop,
  rejectShop,
  deleteShop,
} = require("../controllers/superAdminController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

r.use(protect, superAdminOnly); // all routes require superAdmin

r.get("/stats", getStats);
r.get("/users", getUsers);
r.put("/users/:id/toggle", toggleUser);
r.delete("/users/:id", deleteUser);
r.get("/shops", getShops);
r.put("/shops/:id/approve", approveShop);
r.put("/shops/:id/reject", rejectShop);
r.delete("/shops/:id", deleteShop);

module.exports = r;
