// src/routes/auth.js
import express from "express";
const router = express.Router();

// controllers - ONLY use one implementation
import { signUp, signIn, verifyToken, logout } from "../controllers/authController.js";

// Use the dedicated controller for password reset
import { 
  forgotPassword, 
  resetPassword, 
  cleanupExpiredTokens 
} from "../controllers/forgotPasswordController.js";

// Import rate limiting middleware
import { 
  passwordResetRateLimit, 
  getRateLimitStatus 
} from "../middlewares/rateLimiter.js";

// =========================
//  Auth Routes
// =========================
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-token", verifyToken);
router.post("/logout", logout);

// =========================
//  Forgot/Reset Password Routes (with enhanced security)
// =========================

// Forgot password WITH rate limiting (3 attempts per hour per email)
router.post("/forgot-password", passwordResetRateLimit, forgotPassword);

// Reset password (no rate limiting needed - token validation handles security)
router.post("/reset-password", resetPassword);

// =========================
//  Debug/Admin Routes (REMOVE IN PRODUCTION)
// =========================

// Check rate limit status for debugging
router.get("/rate-limit-status/:email", getRateLimitStatus);

// Manual cleanup of expired tokens
router.post("/cleanup-tokens", cleanupExpiredTokens);

// DEBUG: Clear all rate limits for testing
router.delete("/debug/clear-rate-limits", async (req, res) => {
  try {
    const RateLimit = (await import('../models/RateLimit.js')).default;
    const result = await RateLimit.deleteMany({});
    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} rate limit records`,
      cleared: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DEBUG: Check what's in rate limits collection
router.get("/debug/rate-limits", async (req, res) => {
  try {
    const RateLimit = (await import('../models/RateLimit.js')).default;
    const records = await RateLimit.find({}).sort({ lastAttempt: -1 });
    res.json({ 
      success: true, 
      records: records.map(r => ({
        identifier: r.identifier,
        type: r.type,
        attempts: r.attempts,
        locked: r.isLocked(),
        lastAttempt: r.lastAttempt,
        windowStart: r.windowStart,
        lockedUntil: r.lockedUntil
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;