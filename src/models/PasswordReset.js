// src/models/PasswordReset.js - FIXED VERSION (NO DUPLICATES)
import mongoose from "mongoose";
import crypto from "crypto";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 900000), // 15 minutes
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
      index: true,
    },
    resetAttempts: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better performance
passwordResetSchema.index({ tokenHash: 1, status: 1 });

// FIXED: Single unique index to prevent duplicates per email (removed duplicate)
passwordResetSchema.index({ email: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'active' } 
});

// Instance methods
passwordResetSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

passwordResetSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  this.status = 'used';
  return this.save();
};

passwordResetSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  return this.save();
};

// FIXED: Static method - prevents duplicates
passwordResetSchema.statics.createResetToken = async function(email, ipAddress, userAgent = null) {
  const normalizedEmail = email.toLowerCase();
  
  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hash the token for storage
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // FIXED: Delete/Update existing active tokens for this email first
  await this.updateMany(
    { 
      email: normalizedEmail, 
      status: 'active'
    },
    { 
      $set: { 
        status: 'expired',
        isUsed: false
      }
    }
  );

  // FIXED: Always clean up old expired/used tokens for this email to prevent accumulation
  await this.deleteMany({
    email: normalizedEmail,
    $or: [
      { status: 'expired' },
      { status: 'used' },
      { expiresAt: { $lt: new Date() } }
    ]
  });

  // Create new reset token record - ONLY ONE ACTIVE PER EMAIL
  const resetRecord = await this.create({
    email: normalizedEmail,
    tokenHash,
    ipAddress,
    userAgent,
    expiresAt: new Date(Date.now() + 900000), // 15 minutes
    status: 'active'
  });

  console.log(`🔑 New reset token created for ${email} (ID: ${resetRecord._id})`);
  console.log(`🧹 Cleaned up old tokens for ${email}`);

  return { resetToken, resetRecord };
};

// FIXED: Validate token method
passwordResetSchema.statics.validateToken = async function(token) {
  if (!token) {
    throw new Error("Token is required");
  }

  // Hash the provided token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find the token record
  const resetRecord = await this.findOne({
    tokenHash,
    isUsed: false,
    status: 'active'
  });

  if (!resetRecord) {
    // Increment reset attempts for tracking
    await this.updateOne(
      { tokenHash },
      { $inc: { resetAttempts: 1 } }
    );
    throw new Error("Invalid or expired reset token");
  }

  // Check if expired
  if (resetRecord.isExpired()) {
    // Mark as expired
    await resetRecord.markAsExpired();
    throw new Error("Reset token has expired");
  }

  console.log(`✅ Valid reset token for ${resetRecord.email}`);
  return resetRecord;
};

// FIXED: Auto-cleanup expired tokens periodically
passwordResetSchema.statics.autoCleanup = async function() {
  try {
    // Delete expired tokens
    const expiredResult = await this.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { status: 'expired' },
        { status: 'used', usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Used tokens older than 1 day
      ]
    });

    if (expiredResult.deletedCount > 0) {
      console.log(`🧹 Auto cleanup: Removed ${expiredResult.deletedCount} expired/used tokens`);
    }

    return expiredResult.deletedCount;
  } catch (error) {
    console.error('❌ Auto cleanup error:', error);
    return 0;
  }
};

// Manual cleanup function - when you choose to run it
passwordResetSchema.statics.manualCleanup = async function(options = {}) {
  const {
    olderThan = 7, // days
    includeUsed = true,
    includeExpired = true
  } = options;

  const cutoffDate = new Date(Date.now() - (olderThan * 24 * 60 * 60 * 1000));
  
  const query = {
    createdAt: { $lt: cutoffDate }
  };

  if (includeUsed && includeExpired) {
    query.$or = [
      { status: 'used' },
      { status: 'expired' }
    ];
  } else if (includeUsed) {
    query.status = 'used';
  } else if (includeExpired) {
    query.status = 'expired';
  }

  const result = await this.deleteMany(query);
  
  if (result.deletedCount > 0) {
    console.log(`🧹 Manual cleanup: Removed ${result.deletedCount} old reset tokens`);
  }
  
  return result.deletedCount;
};

// Get statistics - FIXED to show unique users
passwordResetSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // FIXED: Count unique emails instead of total requests per email
  const uniqueUsers = await this.distinct('email');
  
  const recentRequests = await this.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: '$email',
        requestCount: { $sum: 1 },
        latestRequest: { $max: '$createdAt' },
        status: { $last: '$status' }
      }
    },
    { $sort: { latestRequest: -1 } },
    { $limit: 10 }
  ]);

  return {
    statusCounts: stats,
    uniqueUsers: uniqueUsers.length,
    recentRequests: recentRequests,
    total: await this.countDocuments()
  };
};

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;