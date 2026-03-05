require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const readline = require("readline");

// Read from env or fall back to prompting
async function getInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const email    = process.env.SEED_ADMIN_EMAIL    || await getInput("SuperAdmin email: ");
  const password = process.env.SEED_ADMIN_PASSWORD || await getInput("SuperAdmin password: ");
  const name     = process.env.SEED_ADMIN_NAME     || await getInput("SuperAdmin name: ");

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = "superAdmin";
    existing.isEmailVerified = true;
    existing.isActive = true;
    await existing.save();
    console.log("✅ Existing user updated to superAdmin:", email);
  } else {
    await User.create({ name, email, password, role: "superAdmin", isEmailVerified: true, isActive: true });
    console.log("✅ SuperAdmin created:", email);
  }

  console.log("─────────────────────────────────────");
  console.log("  Email   :", email);
  console.log("  Password: [hidden]");
  console.log("─────────────────────────────────────");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
