// src/models/PasswordReset.js
import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true, // para mabilis hanapin by email
    },
    token: {
      type: String,
      required: true,
      index: true, // instead of unique
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 3600000), // 1 hour from now
    },
  },
  {
    timestamps: true, // automatic createdAt, updatedAt
  }
);

// TTL index: auto-delete expired tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

export default PasswordReset;
