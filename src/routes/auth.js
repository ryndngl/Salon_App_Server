// src/routes/auth.js - SIMPLIFIED (NO RATE LIMITING)
import express from "express";
const router = express.Router();

// controllers
import { signUp, signIn, verifyToken, logout } from "../controllers/authController.js";

// Use the dedicated controller for password reset
import { 
  forgotPassword, 
  resetPassword, 
  manualCleanup,
  getResetStats
} from "../controllers/forgotPasswordController.js";

// =========================
//  Auth Routes
// =========================
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-token", verifyToken);
router.post("/logout", logout);

// =========================
//  Forgot/Reset Password Routes (NO RATE LIMITING)
// =========================

// Forgot password - unlimited requests
router.post("/forgot-password", forgotPassword);

// Reset password - unlimited attempts
router.post("/reset-password", resetPassword);

// =========================
//  Admin Routes for managing password resets
// =========================

// Manual cleanup of old tokens (when you want to clean)
router.post("/cleanup-tokens", manualCleanup);

// Get password reset statistics
router.get("/reset-stats", getResetStats);

// Get all password reset records for admin view
router.get("/reset-records", async (req, res) => {
  try {
    const PasswordReset = (await import('../models/PasswordReset.js')).default;
    const records = await PasswordReset.getAllResets();
    res.json({ 
      success: true, 
      records: records.map(r => ({
        id: r._id,
        email: r.email,
        status: r.status,
        isUsed: r.isUsed,
        createdAt: r.createdAt,
        usedAt: r.usedAt,
        ipAddress: r.ipAddress
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manually delete specific password reset record
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
      deleted: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;