// src/models/RateLimit.js - COMPLETE FIXED VERSION
import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true, // email or IP address
    },
    type: {
      type: String,
      required: true,
      enum: ['email', 'ip'],
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      required: true,
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    // Track when the rate limit window started
    windowStart: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookups (unique to prevent duplicates)
rateLimitSchema.index({ identifier: 1, type: 1 }, { unique: true });

// TTL index: auto-delete old records after 2 hours
rateLimitSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 7200 });

// Instance Methods
rateLimitSchema.methods.isLocked = function() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Static Methods
rateLimitSchema.statics.getStatus = async function(identifier, type) {
  const record = await this.findOne({ identifier, type });
  
  if (!record) {
    return {
      attempts: 0,
      locked: false,
      attemptsRemaining: 3,
      windowStart: null,
      lockedUntil: null
    };
  }
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  const windowStart = record.windowStart || record.createdAt;
  
  // Check if window expired
  if (windowStart < oneHourAgo && !record.isLocked()) {
    return {
      attempts: 0,
      locked: false,
      attemptsRemaining: 3,
      windowStart: null,
      lockedUntil: null
    };
  }
  
  return {
    attempts: record.attempts,
    locked: record.isLocked(),
    attemptsRemaining: Math.max(0, 3 - record.attempts),
    windowStart: windowStart,
    lockedUntil: record.lockedUntil,
    lastAttempt: record.lastAttempt
  };
};

// Manual reset method for successful operations
rateLimitSchema.statics.resetLimit = async function(identifier, type) {
  try {
    const result = await this.deleteOne({ identifier, type });
    if (result.deletedCount > 0) {
      console.log(`Rate limit reset for ${type}: ${identifier}`);
    }
    return result.deletedCount;
  } catch (error) {
    console.error(`Error resetting rate limit for ${type}: ${identifier}`, error);
    throw error;
  }
};

// Cleanup expired records
rateLimitSchema.statics.cleanup = async function() {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 7200000); // 2 hours
  
  const result = await this.deleteMany({
    $and: [
      { lastAttempt: { $lt: twoHoursAgo } },
      {
        $or: [
          { lockedUntil: { $lt: now } },
          { lockedUntil: null }
        ]
      }
    ]
  });
  
  if (result.deletedCount > 0) {
    console.log(`Cleaned up ${result.deletedCount} expired rate limit records`);
  }
  
  return result.deletedCount;
};

// FIXED: Make sure to create and export the model properly
const RateLimit = mongoose.model("RateLimit", rateLimitSchema);

export default RateLimit;