// src/controllers/forgotPasswordController.js - With email support + validateToken endpoint
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import PasswordReset from "../models/PasswordReset.js";
import bcrypt from "bcrypt";
import { sendMobileResetEmail, sendAdminResetEmail } from "../services/emailService.js";

// Mobile forgot password with email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    console.log(` Mobile password reset requested for: ${email}`);

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
        isSuccess: true
      });
    }

    // Create reset token
    const { resetToken, resetRecord } = await PasswordReset.createResetToken(
      email,
      ipAddress,
      userAgent
    );

    // Send email with reset link
    const emailResult = await sendMobileResetEmail(email, resetToken);
    
    if (emailResult.success) {
      console.log(` Mobile reset email sent successfully to: ${email}`);
      res.status(200).json({
        message: "Reset instructions sent to your email",
        isSuccess: true,
        // Remove this in production - only for testing
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } else {
      console.error(` Failed to send email to: ${email}`);
      res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
        isSuccess: false
      });
    }
  } catch (error) {
    console.error("Mobile forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      isSuccess: false
    });
  }
};

// Admin forgot password with email
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    console.log(` Admin password reset requested for: ${email}`);

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: "If this admin email exists, a reset code has been sent",
        isSuccess: true
      });
    }

    // Create 6-digit reset code
    const { resetCode, resetRecord } = await PasswordReset.createAdminResetCode(
      email,
      ipAddress,
      userAgent
    );

    // Send email with 6-digit code
    const emailResult = await sendAdminResetEmail(email, resetCode);
    
    if (emailResult.success) {
      console.log(` Admin reset email sent successfully to: ${email}`);
      res.status(200).json({
        message: "Admin reset code sent to your email",
        isSuccess: true,
        expiresIn: "15 minutes",
        // Return code only in development
        resetCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
      });
    } else {
      console.error(`❌ Failed to send admin email to: ${email}`);
      res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
        isSuccess: false
      });
    }
  } catch (error) {
    console.error("Admin forgot password error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
};

// Clean validateToken function - replace sa forgotPasswordController.js mo
export const validateToken = async (req, res) => {
  try {
    const { token, type = 'mobile' } = req.body;

    console.log(` Token validation requested - Type: ${type}`);

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
        isSuccess: false
      });
    }

    // Use the same validation logic as resetPassword
    const resetRecord = await PasswordReset.validateToken(token, type);
    
    // If we reach here, token is valid
    console.log(` Token validation successful for: ${resetRecord.email}`);
    
    res.status(200).json({
      message: "Token is valid",
      isSuccess: true,
      success: true,
      email: resetRecord.email
    });
    
  } catch (error) {
    // CLEAN ERROR LOGGING - No stack trace for expected errors
    if (error.message.includes("Invalid") || error.message.includes("expired")) {
      console.log(` Token validation failed: ${error.message}`);
      return res.status(400).json({
        message: error.message,
        isSuccess: false
      });
    }
    
    // Only log full error for unexpected issues
    console.error("Unexpected token validation error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
};

// Enhanced reset password (supports both mobile and admin)
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, type = 'mobile' } = req.body;

    console.log(` Password reset attempt - Type: ${type}`);

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
        isSuccess: false
      });
    }

    // Validate token/code
    const resetRecord = await PasswordReset.validateToken(token, type);
    
    // Hash new password
    const saltRounds = type === 'admin' ? 12 : 10; // Higher security for admin
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password based on type
    if (type === 'admin') {
      const admin = await Admin.findOne({ email: resetRecord.email });
      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
          isSuccess: false
        });
      }
      
      admin.password = hashedPassword;
      await admin.save();
      console.log(` Admin password updated for: ${resetRecord.email}`);
    } else {
      const user = await User.findOne({ email: resetRecord.email });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          isSuccess: false
        });
      }
      
      user.password = hashedPassword;
      await user.save();
      console.log(` User password updated for: ${resetRecord.email}`);
    }

    // Mark token as used
    await resetRecord.markAsUsed();

    res.status(200).json({
      message: "Password reset successfully",
      isSuccess: true,
      success: true  // Add both for compatibility
    });
  } catch (error) {
    // CLEAN ERROR LOGGING - No stack trace
    if (error.message.includes("Invalid") || error.message.includes("expired")) {
      console.log(` Password reset failed: ${error.message}`);
      return res.status(400).json({
        message: error.message,
        isSuccess: false
      });
    }
    
    // Only log full error for unexpected issues
    console.error("Unexpected reset password error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
};

// Cleanup expired tokens
export const manualCleanup = async (req, res) => {
  try {
    const expiredCount = await PasswordReset.cleanupExpired();
    
    res.status(200).json({
      message: `Cleanup completed. ${expiredCount} tokens marked as expired`,
      isSuccess: true,
      expiredCount
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
};

// Get reset statistics
export const getResetStats = async (req, res) => {
  try {
    const stats = await PasswordReset.getStats();
    
    res.status(200).json({
      isSuccess: true,
      stats
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      message: "Internal server error",
      isSuccess: false
    });
  }
};