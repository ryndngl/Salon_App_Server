// src/models/PasswordReset.js - SIMPLIFIED VERSION (NO EXPIRATION, PERSISTENT)
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
      enum: ['active', 'used'],
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

// Indexes for better performance
passwordResetSchema.index({ tokenHash: 1, status: 1 });
passwordResetSchema.index({ email: 1, status: 1 });

// Instance methods
passwordResetSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  this.status = 'used';
  return this.save();
};

// UPDATED: Create reset token - updates existing record instead of creating new one
passwordResetSchema.statics.createResetToken = async function(email, ipAddress, userAgent = null) {
  const normalizedEmail = email.toLowerCase();
  
  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hash the token for storage
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Check if there's already an existing record for this email
  let resetRecord = await this.findOne({ email: normalizedEmail });

  if (resetRecord) {
    // UPDATE existing record instead of creating new one
    resetRecord.tokenHash = tokenHash;
    resetRecord.status = 'active';
    resetRecord.isUsed = false;
    resetRecord.usedAt = null;
    resetRecord.ipAddress = ipAddress;
    resetRecord.userAgent = userAgent;
    resetRecord.resetAttempts = 0;
    
    await resetRecord.save();
    console.log(`🔄 Updated existing reset token for ${email} (ID: ${resetRecord._id})`);
    console.log(`🆔 New tokenHash ending: ${tokenHash.slice(-3)}`);
  } else {
    // CREATE new record only if no existing record
    resetRecord = await this.create({
      email: normalizedEmail,
      tokenHash,
      ipAddress,
      userAgent,
      status: 'active'
    });
    console.log(`🔑 New reset token created for ${email} (ID: ${resetRecord._id})`);
    console.log(`🆔 TokenHash ending: ${tokenHash.slice(-3)}`);
  }

  return { resetToken, resetRecord };
};

// UPDATED: Validate token method - no expiration check
passwordResetSchema.statics.validateToken = async function(token) {
  if (!token) {
    throw new Error("Token is required");
  }

  // Hash the provided token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find the token record - only check if active and not used
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

  console.log(`✅ Valid reset token for ${resetRecord.email}`);
  return resetRecord;
};

// Manual cleanup function - for admin use when you want to clean
passwordResetSchema.statics.manualCleanup = async function(options = {}) {
  const {
    olderThan = 7, // days
    includeUsed = true
  } = options;

  const cutoffDate = new Date(Date.now() - (olderThan * 24 * 60 * 60 * 1000));
  
  const query = {
    createdAt: { $lt: cutoffDate }
  };

  if (includeUsed) {
    query.status = 'used';
  }

  const result = await this.deleteMany(query);
  
  if (result.deletedCount > 0) {
    console.log(`🧹 Manual cleanup: Removed ${result.deletedCount} old reset tokens`);
  }
  
  return result.deletedCount;
};

// Get statistics - shows all password reset attempts
passwordResetSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Count unique emails that have reset passwords
  const uniqueUsers = await this.distinct('email');
  
  // Recent requests (last 24 hours)
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

// Get all password reset records for admin view
passwordResetSchema.statics.getAllResets = async function() {
  return await this.find({})
    .sort({ createdAt: -1 })
    .select('email status isUsed createdAt usedAt ipAddress')
    .limit(100); // Limit to prevent overload
};

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;