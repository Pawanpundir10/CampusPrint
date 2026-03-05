const Order = require("../models/Order");
const Shop = require("../models/Shop");

const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    const { status, payment } = req.query;
    const filter = { shopId: shop._id };
    if (status) filter.orderStatus = status;
    if (payment) filter.paymentStatus = payment;
    const orders = await Order.find(filter)
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (
      !["pending", "printing", "ready", "completed", "cancelled"].includes(
        status,
      )
    )
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id).populate("shopId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.shopId.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your shop's order" });

    order.orderStatus = status;

    // When student collects = completed → auto mark as paid
    if (status === "completed") {
      order.paymentStatus = "paid";
      await Shop.findByIdAndUpdate(order.shopId._id, {
        $inc: { totalEarnings: order.totalAmount },
      });
    }

    await order.save();
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markPaymentReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("shopId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.shopId.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your shop's order" });
    order.paymentStatus = "paid";
    await order.save();
    await Shop.findByIdAndUpdate(order.shopId._id, {
      $inc: { totalEarnings: order.totalAmount },
    });
    res.json({ message: "Payment received", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const paid = await Order.find({ shopId: shop._id, paymentStatus: "paid" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEarnings = paid
      .filter((o) => new Date(o.updatedAt) >= today)
      .reduce((s, o) => s + o.totalAmount, 0);
    const monthEarnings = paid
      .filter((o) => new Date(o.updatedAt) >= monthStart)
      .reduce((s, o) => s + o.totalAmount, 0);

    const [total, pending, completed, cancelled] = await Promise.all([
      Order.countDocuments({ shopId: shop._id }),
      Order.countDocuments({ shopId: shop._id, orderStatus: "pending" }),
      Order.countDocuments({ shopId: shop._id, orderStatus: "completed" }),
      Order.countDocuments({ shopId: shop._id, orderStatus: "cancelled" }),
    ]);

    const sixAgo = new Date();
    sixAgo.setMonth(sixAgo.getMonth() - 6);
    const monthly = await Order.aggregate([
      {
        $match: {
          shopId: shop._id,
          paymentStatus: "paid",
          createdAt: { $gte: sixAgo },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          earnings: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    res.json({
      shop,
      totalEarnings: shop.totalEarnings,
      todayEarnings,
      monthEarnings,
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getShopOrders,
  updateOrderStatus,
  markPaymentReceived,
  getEarnings,
};
