const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  publicId: { type: String, default: "" },
  pages: { type: Number, required: true, min: 1 },
  copies: { type: Number, required: true, min: 1, default: 1 },
  printType: { type: String, enum: ["bw", "color"], default: "bw" },
  amount: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    files: [fileSchema],
    totalAmount: { type: Number, required: true },
    // Cash-only for now, but keep field for future extensibility
    paymentMethod: {
      type: String,
      enum: ["cash"],
      default: "cash",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "printing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
