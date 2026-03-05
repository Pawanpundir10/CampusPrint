const Order = require("../models/Order");
const Shop = require("../models/Shop");
const supabase = require("../config/supabase");

const createOrder = async (req, res) => {
  try {
    const { shopId, files, notes } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (!shop.isOpen)
      return res.status(400).json({ message: "Shop is currently closed" });
    if (!files || files.length === 0)
      return res.status(400).json({ message: "At least one file required" });

    const processedFiles = files.map((f) => {
      const price = f.printType === "color" ? shop.colorPrice : shop.bwPrice;
      const amount = f.pages * f.copies * price;
      return { ...f, amount };
    });

    const totalAmount = processedFiles.reduce((s, f) => s + f.amount, 0);
    const order = await Order.create({
      studentId: req.user._id,
      shopId,
      files: processedFiles,
      totalAmount,
      paymentMethod: "cash",
      paymentStatus: "pending",
      notes: notes || "",
    });
    await order.populate(
      "shopId",
      "shopName collegeName bwPrice colorPrice phone",
    );
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user._id })
      .populate("shopId", "shopName collegeName phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(
        "shopId",
        "shopName collegeName phone location bwPrice colorPrice",
      )
      .populate("studentId", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isStudent =
      order.studentId._id.toString() === req.user._id.toString();
    const shop = await Shop.findById(order.shopId);
    const isShopOwner = shop?.ownerId.toString() === req.user._id.toString();
    if (!isStudent && !isShopOwner)
      return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.studentId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your order" });
    if (order.orderStatus !== "pending")
      return res
        .status(400)
        .json({ message: "Can only cancel pending orders" });

    order.orderStatus = "cancelled";
    order.cancellationReason = req.body.reason || "Cancelled by student";
    order.paymentStatus = "refunded";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const uploaded = [];

    for (const file of req.files) {
      // Generate file path in Supabase storage
      const filePath = `orders/${Date.now()}_${file.originalname}`;

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from("orders")
        .upload(filePath, file.buffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({ message: "File upload failed" });
      }

      uploaded.push({
        // Store just the path (not full URL) — served through backend proxy
        fileUrl: `/orders/pdf/${filePath}`,
        fileName: file.originalname,
        filePath: filePath, // Store for later deletion
      });
    }

    res.json({ files: uploaded });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  uploadFiles,
};
