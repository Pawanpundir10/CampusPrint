const Shop = require("../models/Shop");
const User = require("../models/User");
const {
  sendShopVerificationRequest,
  sendShopApprovedEmail,
  sendShopRejectedEmail,
} = require("../config/mailer");

const getShops = async (req, res) => {
  try {
    const { college } = req.query;
    const filter = { verificationStatus: "approved" }; // only show verified shops
    if (college) filter.collegeName = { $regex: college, $options: "i" };
    const shops = await Shop.find(filter).populate(
      "ownerId",
      "name email phone",
    );
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getColleges = async (req, res) => {
  try {
    const colleges = await Shop.distinct("collegeName", {
      verificationStatus: "approved",
    });
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      "ownerId",
      "name email phone",
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createShop = async (req, res) => {
  try {
    if (req.user.shopId)
      return res.status(400).json({ message: "You already have a shop" });
    const {
      shopName,
      collegeName,
      location,
      description,
      phone,
      bwPrice,
      colorPrice,
    } = req.body;
    if (!shopName || !collegeName)
      return res
        .status(400)
        .json({ message: "Shop name and college required" });

    const shop = await Shop.create({
      shopName,
      collegeName,
      location,
      description,
      phone,
      bwPrice: bwPrice || 1,
      colorPrice: colorPrice || 5,
      ownerId: req.user._id,
      verificationStatus: "pending",
      isOpen: false, // closed until approved
    });

    await User.findByIdAndUpdate(req.user._id, { shopId: shop._id });

    // Notify platform admin for verification
    try {
      await sendShopVerificationRequest(shop, req.user);
    } catch (e) {
      console.error("Shop verification mail error:", e.message);
    }

    res
      .status(201)
      .json({
        shop,
        message:
          "Shop created! Verification request sent. You'll be notified once approved.",
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.ownerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your shop" });

    // If shop was rejected and owner updates it, re-submit for verification
    const resubmit = shop.verificationStatus === "rejected";
    Object.assign(shop, req.body);
    if (resubmit) {
      shop.verificationStatus = "pending";
      shop.isOpen = false;
      try {
        await sendShopVerificationRequest(shop, req.user);
      } catch (e) {}
    }

    await shop.save();
    res.json({
      shop,
      message: resubmit
        ? "Shop updated and re-submitted for verification!"
        : "Shop updated!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) return res.status(404).json({ message: "No shop found" });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Platform Admin: Approve / Reject via email link ──────────────
const verifyShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.query;

    const shop = await Shop.findById(id).populate("ownerId");
    if (!shop) return res.status(404).send("Shop not found");

    if (action === "approve") {
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
      } catch (e) {}
      return res.send(
        `<h2 style="font-family:sans-serif;color:green">✅ Shop "${shop.shopName}" approved and is now live!</h2>`,
      );
    }

    if (action === "reject") {
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
      } catch (e) {}
      return res.send(
        `<h2 style="font-family:sans-serif;color:red">❌ Shop "${shop.shopName}" rejected. Owner has been notified.</h2>`,
      );
    }

    res.status(400).send("Invalid action");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  getShops,
  getColleges,
  getShopById,
  createShop,
  updateShop,
  getMyShop,
  verifyShop,
};
