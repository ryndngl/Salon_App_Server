// src/middlewares/rateLimiter.js - COMPLETELY FIXED VERSION
import RateLimit from "../models/RateLimit.js";

// Get real IP address (handles proxies, load balancers) - kept for logging purposes
const getRealIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         'unknown';
};

// COMPLETELY FIXED: Rate limiting middleware for password reset
export const passwordResetRateLimit = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ipAddress = getRealIP(req);

    console.log(`🔒 Rate limit check - Email: ${email}, IP: ${ipAddress}`);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for rate limiting check",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    // STEP 1: Clean up expired records FIRST 
    await RateLimit.deleteMany({
      identifier: normalizedEmail,
      type: 'email',
      $or: [
        { lockedUntil: { $lt: now } },
        { 
          windowStart: { $lt: new Date(now.getTime() - 3600000) }, // 1 hour ago
          lockedUntil: null 
        }
      ]
    });

    // STEP 2: Get current status using model method
    const currentStatus = await RateLimit.getStatus(normalizedEmail, 'email');
    
    // STEP 3: Check if locked or at limit BEFORE incrementing
    if (currentStatus.locked) {
      const record = await RateLimit.findOne({ 
        identifier: normalizedEmail, 
        type: 'email' 
      });
      
      const minutesLeft = record ? Math.ceil((record.lockedUntil - now) / (1000 * 60)) : 0;
      
      console.log(`❌ Rate limit exceeded for email: ${normalizedEmail} (${currentStatus.attempts}/3 attempts, ${minutesLeft} minutes left)`);
      
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. You have used all 3 attempts. Try again in ${minutesLeft} minutes.`,
        type: "RATE_LIMIT_EXCEEDED",
        attemptsUsed: currentStatus.attempts,
        maxAttempts: 3,
        minutesLeft: minutesLeft
      });
    }

    // STEP 4: Now safely increment attempts
    try {
      let emailRecord = await RateLimit.findOne({
        identifier: normalizedEmail,
        type: 'email'
      });

      if (!emailRecord) {
        // Create new record for first attempt
        emailRecord = await RateLimit.create({
          identifier: normalizedEmail,
          type: 'email',
          attempts: 1,
          lastAttempt: now,
          windowStart: now
        });
        
        console.log(`✅ First attempt for email: ${normalizedEmail} (1/3)`);
      } else {
        // Increment existing record
        await emailRecord.incrementAttempts();
        
        // Get updated record
        emailRecord = await RateLimit.findOne({
          identifier: normalizedEmail,
          type: 'email'
        });
        
        console.log(`✅ Rate limit passed - Email attempts: ${emailRecord.attempts}/3`);
      }

      // STEP 5: Add rate limit info to request
      req.rateLimitInfo = {
        email: normalizedEmail,
        ip: ipAddress,
        emailAttempts: emailRecord.attempts,
        attemptsRemaining: Math.max(0, 3 - emailRecord.attempts)
      };

      next();

    } catch (incrementError) {
      console.error("❌ Error incrementing attempts:", incrementError);
      throw incrementError;
    }

  } catch (error) {
    console.error("❌ Rate limiter error:", error);
    return res.status(500).json({
      success: false,
      message: "Rate limiting service error. Please try again.",
    });
  }
};

// SUCCESS: Reset rate limit after successful password reset
export const resetRateLimit = async (identifier, type) => {
  try {
    const result = await RateLimit.deleteMany({ 
      identifier: identifier.toLowerCase(), 
      type 
    });
    
    console.log(`🧹 Rate limit reset for ${type}: ${identifier} (${result.deletedCount} records removed)`);
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Error resetting rate limit:", error);
    return 0;
  }
};

// Updated: Get current rate limit status
export const getRateLimitStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const ipAddress = getRealIP(req);
    const normalizedEmail = email.toLowerCase();

    // Clean up expired records first
    await RateLimit.deleteMany({
      identifier: normalizedEmail,
      type: 'email',
      expiresAt: { $lt: new Date() }
    });

    // Get current valid record
    const emailRecord = await RateLimit.findOne({ 
      identifier: normalizedEmail, 
      type: 'email',
      expiresAt: { $gt: new Date() }
    });

    const attempts = emailRecord?.attempts || 0;
    const attemptsRemaining = Math.max(0, 3 - attempts);
    const isLocked = attempts >= 3;
    const minutesLeft = emailRecord && isLocked ? 
      Math.ceil((emailRecord.expiresAt - new Date()) / (1000 * 60)) : 0;

    res.json({
      success: true,
      rateLimits: {
        email: {
          attempts: attempts,
          attemptsRemaining: attemptsRemaining,
          locked: isLocked,
          minutesLeft: minutesLeft,
          lockedUntil: emailRecord?.expiresAt || null,
          lastAttempt: emailRecord?.lastAttempt || null
        },
        info: {
          message: "Rate limiting is EMAIL-ONLY based",
          limit: "3 attempts per hour per email address",
          currentIP: ipAddress
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rate limit status",
      error: error.message
    });
  }
};