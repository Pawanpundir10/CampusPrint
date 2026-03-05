const nodemailer = require("nodemailer");

console.log("📧 Mailer Config:");
console.log("   Brevo User:", process.env.BREVO_USER);
console.log(
  "   Brevo SMTP Key:",
  process.env.BREVO_SMTP_KEY ? "✓ Set" : "❌ Missing",
);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email service error:", error.message);
  } else {
    console.log("✅ Email service ready");
  }
});

const BASE = process.env.CLIENT_URL || "http://localhost:5173";
const BASE_API = process.env.API_URL || "http://localhost:5000/api";

// ─── Email Templates ──────────────────────────────────────────────

const emailBase = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background:#f4f4f4; margin:0; padding:0; }
    .wrap { max-width:520px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:#0A0A0A; padding:28px 32px; }
    .logo { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    .logo span { color:#F97316; }
    .body { padding:32px; }
    .title { font-size:22px; font-weight:700; color:#111; margin-bottom:8px; }
    .text { color:#555; font-size:15px; line-height:1.6; margin-bottom:20px; }
    .btn { display:inline-block; background:#F97316; color:#fff !important; text-decoration:none; padding:14px 32px; border-radius:12px; font-weight:700; font-size:15px; margin:8px 0 20px; }
    .divider { border:none; border-top:1px solid #eee; margin:24px 0; }
    .small { color:#999; font-size:13px; line-height:1.5; }
    .footer { background:#f9f9f9; padding:20px 32px; text-align:center; color:#aaa; font-size:12px; border-top:1px solid #eee; }
    .badge { display:inline-block; background:#FFF7ED; color:#F97316; border:1px solid #FED7AA; padding:4px 12px; border-radius:99px; font-size:13px; font-weight:600; margin-bottom:16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">Campus<span>Print</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">© 2025 CampusPrint · Smart Campus Printing</div>
  </div>
</body>
</html>`;

// 1. Email Verification
const sendVerificationEmail = async (to, name, token) => {
  const link = `${BASE_API}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your CampusPrint email",
    html: emailBase(`
      <div class="badge">Email Verification</div>
      <div class="title">Hi ${name} 👋</div>
      <p class="text">Thanks for signing up! Please verify your email address to activate your account.</p>
      <a href="${link}" class="btn">Verify Email →</a>
      <hr class="divider"/>
      <p class="small">This link expires in <strong>24 hours</strong>. If you didn't sign up, ignore this email.</p>
    `),
  });
};

// 2. Forgot Password
const sendPasswordResetEmail = async (to, name, token) => {
  const link = `${BASE}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your CampusPrint password",
    html: emailBase(`
      <div class="badge">Password Reset</div>
      <div class="title">Reset your password</div>
      <p class="text">Hi ${name}, we received a request to reset your password. Click the button below to set a new one.</p>
      <a href="${link}" class="btn">Reset Password →</a>
      <hr class="divider"/>
      <p class="small">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    `),
  });
};

// 3. Shop Verification Request → sent to platform admin
const sendShopVerificationRequest = async (shop, owner) => {
  const approveLink = `${process.env.BASE_URL}/api/shops/verify/${shop._id}?action=approve`;
  const rejectLink = `${process.env.BASE_URL}/api/shops/verify/${shop._id}?action=reject`;
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Shop Verification Request — ${shop.shopName}`,
    html: emailBase(`
      <div class="badge">Shop Verification</div>
      <div class="title">${shop.shopName}</div>
      <p class="text">A new print shop has submitted a verification request.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${[
          ["Shop Name", shop.shopName],
          ["College", shop.collegeName],
          ["Location", shop.location || "—"],
          ["Owner", owner.name],
          ["Email", owner.email],
          ["Phone", owner.phone || "—"],
          ["B/W Price", `₹${shop.bwPrice}/page`],
          ["Color Price", `₹${shop.colorPrice}/page`],
        ]
          .map(
            ([k, v]) => `
          <tr>
            <td style="padding:8px 12px;background:#f9f9f9;color:#666;font-size:13px;border-radius:4px;font-weight:600;">${k}</td>
            <td style="padding:8px 12px;color:#111;font-size:13px;">${v}</td>
          </tr>
        `,
          )
          .join("")}
      </table>
      <a href="${approveLink}" class="btn" style="background:#16A34A;margin-right:8px;">✓ Approve Shop</a>
      <a href="${rejectLink}"  class="btn" style="background:#DC2626;">✗ Reject Shop</a>
    `),
  });
};

// 4. Shop Approved → sent to shop owner
const sendShopApprovedEmail = async (to, name, shopName) => {
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 Your shop "${shopName}" is approved!`,
    html: emailBase(`
      <div class="badge">Shop Approved ✓</div>
      <div class="title">Congratulations, ${name}! 🎉</div>
      <p class="text">Your shop <strong>${shopName}</strong> has been verified and is now live on CampusPrint. Students can now find and place orders at your shop.</p>
      <a href="${BASE}/admin/orders" class="btn">Go to Dashboard →</a>
    `),
  });
};

// 5. Shop Rejected → sent to shop owner
const sendShopRejectedEmail = async (to, name, shopName, reason) => {
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Shop verification update — ${shopName}`,
    html: emailBase(`
      <div class="badge" style="background:#FEF2F2;color:#DC2626;border-color:#FECACA;">Verification Update</div>
      <div class="title">Hi ${name},</div>
      <p class="text">Unfortunately, your shop <strong>${shopName}</strong> could not be verified at this time.</p>
      ${reason ? `<p class="text"><strong>Reason:</strong> ${reason}</p>` : ""}
      <p class="text">Please update your shop details and resubmit for verification.</p>
      <a href="${BASE}/admin/shop" class="btn">Update Shop →</a>
    `),
  });
};

// 6. Welcome email after verification
const sendWelcomeEmail = async (to, name, role) => {
  await transporter.sendMail({
    from: `"CampusPrint" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to CampusPrint! 🖨️",
    html: emailBase(`
      <div class="title">Welcome, ${name}! 🎉</div>
      <p class="text">Your email is verified. You're all set to use CampusPrint as a <strong>${role === "admin" ? "Shop Owner" : "Student"}</strong>.</p>
      <a href="${BASE}/${role === "admin" ? "admin/shop" : "student/shops"}" class="btn">
        ${role === "admin" ? "Set Up Your Shop →" : "Browse Print Shops →"}
      </a>
    `),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendShopVerificationRequest,
  sendShopApprovedEmail,
  sendShopRejectedEmail,
  sendWelcomeEmail,
};
