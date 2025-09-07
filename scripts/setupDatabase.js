// scripts/setupDatabase.js - Run this once to create initial admin
import mongoose from "mongoose";
import Admin from "../src/models/Admin.js";
import connect from "../src/config/connection.js";
import dotenv from "dotenv";

dotenv.config();

async function setupDatabase() {
  try {
    // Connect to database
    await connect();
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("❌ Admin already exists:", existingAdmin.username);
      process.exit(0);
    }

    // Create initial admin
    const adminData = {
      username: "admin",
      email: "admin@vansglow.com", 
      password: "admin123", // Change this to a secure password
      role: "super-admin"
    };

    const admin = await Admin.createAdmin(adminData);
    console.log("✅ Initial admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Username:", admin.username);
    console.log("🔑 Password: admin123 (CHANGE THIS!)");
    console.log("🔐 ID:", admin._id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup error:", error);
    process.exit(1);
  }
}

setupDatabase();