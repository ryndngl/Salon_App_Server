// src/routes/auth.js - Enhanced with admin routes + validateToken
import express from "express";
const router = express.Router();

// controllers
import { 
  signUp, 
  signIn, 
  adminSignIn,
  verifyToken, 
  logout,
  createInitialAdmin
} from "../controllers/authController.js";

import { 
  forgotPassword,
  adminForgotPassword,
  validateToken,        // ADD THIS IMPORT
  resetPassword, 
  manualCleanup,
  getResetStats
} from "../controllers/forgotPasswordController.js";

// =========================
//  Mobile User Auth Routes
// =========================
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-token", verifyToken);
router.post("/logout", logout);

// =========================
//  Admin Auth Routes (NEW)
// =========================
router.post("/admin/sign-in", adminSignIn);
router.post("/admin/create-initial", createInitialAdmin); // Run once to create first admin

// =========================
//  Forgot/Reset Password Routes
// =========================

// Mobile user password reset (existing)
router.post("/forgot-password", forgotPassword);

// Admin password reset (NEW)
router.post("/admin/forgot-password", adminForgotPassword);

// NEW: Token validation endpoint (for frontend validation before navigation)
router.post("/validate-token", validateToken);

// Universal reset password (handles both mobile and admin)
router.post("/reset-password", resetPassword);

// =========================
//  Password Reset Management
// =========================

// Manual cleanup of expired tokens
router.post("/cleanup-tokens", manualCleanup);

// Get password reset statistics
router.get("/reset-stats", getResetStats);

// Get all password reset records for admin view
router.get("/reset-records", async (req, res) => {
  try {
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    const records = await PasswordReset.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select('email type status isUsed createdAt usedAt expiresAt ipAddress');
      
    res.json({ 
      success: true, 
      records: records.map(r => ({
        id: r._id,
        email: r.email,
        type: r.type,
        status: r.status,
        isUsed: r.isUsed,
        createdAt: r.createdAt,
        usedAt: r.usedAt,
        expiresAt: r.expiresAt,
        ipAddress: r.ipAddress,
        isExpired: r.isExpired()
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete specific password reset record
router.delete("/reset-record/:id", async (req, res) => {
  try {
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    const result = await PasswordReset.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Password reset record deleted successfully",
      deleted: {
        id: result._id,
        email: result.email,
        type: result.type
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =========================
//  Admin Management Routes
// =========================

// Get admin profile
router.get("/admin/profile", async (req, res) => {
  try {
    // You can add auth middleware here later
    const Admin = (await import('../models/Admin.js')).default;
    const adminId = req.user?.id; // From auth middleware
    
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    
    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test route to check if admin exists
router.get("/admin/check", async (req, res) => {
  try {
    const Admin = (await import('../models/Admin.js')).default;
    const adminCount = await Admin.countDocuments();
    
    res.json({
      success: true,
      hasAdmin: adminCount > 0,
      adminCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;