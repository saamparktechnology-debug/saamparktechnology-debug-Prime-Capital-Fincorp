// src/scripts/seedAdmin.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedAdmin() {
  try {
    const email = "admin@microfinance.com";
    const password = "AdminSecure123!";
    const fullName = "System Administrator";
    const phoneNumber = "9876543210";

    // Check if admin already exists
    const [existing] = await pool.query(
      "SELECT admin_id FROM admins WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      console.log("Admin account already exists!");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (email, password_hash, full_name, phone_number, is_active) 
             VALUES (?, ?, ?, ?, TRUE)`,
      [email, passwordHash, fullName, phoneNumber],
    );

    console.log("SUCCESS: Default Admin account seeded!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
