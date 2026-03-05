const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    collegeName: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    phone: { type: String, default: "" },
    bwPrice: { type: Number, required: true, default: 1 },
    colorPrice: { type: Number, required: true, default: 5 },
    isOpen: { type: Boolean, default: false }, // closed until verified
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalEarnings: { type: Number, default: 0 },

    // Shop verification
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNote: { type: String, default: "" }, // rejection reason
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Shop", shopSchema);
