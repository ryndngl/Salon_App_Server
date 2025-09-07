// src/models/PasswordReset.js - Simplified version without resetAttempts
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";

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
    type: {
      type: String,
      enum: ['mobile', 'admin'],
      default: 'mobile',
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
    expiresAt: {
      type: Date,
      required: true,
      index: true,
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
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
passwordResetSchema.index({ tokenHash: 1, status: 1 });
passwordResetSchema.index({ email: 1, status: 1, type: 1 });
passwordResetSchema.index({ expiresAt: 1 });

// Simplified markAsUsed method
passwordResetSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  this.status = 'used';
  
  console.log(`✅ Token marked as used for ${this.email}`);
  
  return this.save();
};

passwordResetSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Create reset token for MOBILE
passwordResetSchema.statics.createResetToken = async function(email, ipAddress, userAgent = null) {
  const normalizedEmail = email.toLowerCase();
  
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  let resetRecord = await this.findOneAndUpdate(
    { 
      email: normalizedEmail, 
      type: 'mobile'
    },
    {
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
      status: 'active',
      isUsed: false,
      usedAt: null
    },
    { 
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  console.log(`📱 Mobile reset token updated for ${email} (ID: ${resetRecord._id})`);
  console.log(`🔑 TokenHash ending: ...${tokenHash.slice(-6)}`);
  
  return { resetToken, resetRecord };
};

// Create 6-digit code for ADMIN
passwordResetSchema.statics.createAdminResetCode = async function(email, ipAddress, userAgent = null) {
  const normalizedEmail = email.toLowerCase();
  
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const saltRounds = 10;
  const tokenHash = await bcrypt.hash(resetCode, saltRounds);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  let resetRecord = await this.findOneAndUpdate(
    { 
      email: normalizedEmail, 
      type: 'admin'
    },
    {
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
      status: 'active',
      isUsed: false,
      usedAt: null
    },
    { 
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  console.log(`🔐 Admin reset code updated for ${email} (ID: ${resetRecord._id})`);
  console.log(`🔢 Code: ${resetCode} (expires in 15 min)`);
  
  return { resetCode, resetRecord };
};

// Simplified validate token method
passwordResetSchema.statics.validateToken = async function(token, type = 'mobile') {
  if (!token) {
    throw new Error("Token is required");
  }

  let resetRecord;

  if (type === 'mobile') {
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    resetRecord = await this.findOne({
      tokenHash,
      type: 'mobile',
      isUsed: false,
      status: 'active'
    });

    if (!resetRecord) {
      throw new Error("Invalid reset token");
    }

    console.log(`✅ Valid mobile reset token for ${resetRecord.email}`);
    
  } else if (type === 'admin') {
    const activeRecords = await this.find({
      type: 'admin',
      isUsed: false,
      status: 'active'
    });

    for (const record of activeRecords) {
      const isMatch = await bcrypt.compare(token, record.tokenHash);
      if (isMatch) {
        resetRecord = record;
        break;
      }
    }

    if (!resetRecord) {
      throw new Error("Invalid admin reset code");
    }

    if (resetRecord.isExpired()) {
      resetRecord.status = 'expired';
      await resetRecord.save();
      throw new Error("Admin reset code has expired");
    }

    console.log(`✅ Valid admin reset code for ${resetRecord.email}`);
  }

  return resetRecord;
};

// Clean up expired tokens
passwordResetSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: 'active',
      type: 'admin'
    },
    { 
      status: 'expired' 
    }
  );
  
  if (result.modifiedCount > 0) {
    console.log(`🧹 Marked ${result.modifiedCount} admin tokens as expired`);
  }
  
  return result.modifiedCount;
};

// Get statistics
passwordResetSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: { status: '$status', type: '$type' },
        count: { $sum: 1 }
      }
    }
  ]);

  const uniqueUsers = await this.distinct('email');
  
  const recentRequests = await this.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { email: '$email', type: '$type' },
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