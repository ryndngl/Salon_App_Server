// Updated forgotPasswordController.js - Replace your existing file with this

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import PasswordReset from "../models/PasswordReset.js";
import bcrypt from "bcrypt";
import { sendMobileResetEmail, sendAdminResetEmail } from "../services/emailService.js";

// Mobile forgot password with enhanced debugging
export const forgotPassword = async (req, res) => {
  console.log('=== MOBILE FORGOT PASSWORD REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('IP:', req.ip || req.connection.remoteAddress);
  
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    console.log(`📧 Mobile password reset requested for: ${email}`);

    if (!email) {
      console.log('❌ No email provided in request');
      return res.status(400).json({
        success: false,
        isSuccess: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists in database...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`⚠️ User not found for email: ${email}`);
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
        success: true,
        isSuccess: true
      });
    }

    console.log(`✅ User found: ${user._id}`);

    // Create reset token
    console.log('🎯 Creating reset token...');
    const { resetToken, resetRecord } = await PasswordReset.createResetToken(
      email,
      ipAddress,
      userAgent
    );
    console.log(`🔑 Reset token created: ${resetToken.substring(0, 10)}...`);

    // Send email with reset link
    console.log('📤 Attempting to send reset email...');
    const emailResult = await sendMobileResetEmail(email, resetToken);
    
    if (emailResult.success) {
      console.log(`✅ Mobile reset email sent successfully to: ${email}`);
      
      const responseData = {
        message: "Reset instructions sent to your email",
        success: true,
        isSuccess: true
      };
      
      // Add token in development for testing
      if (process.env.NODE_ENV === 'development') {
        responseData.resetToken = resetToken;
        console.log(`🧪 Development mode - including token: ${resetToken}`);
      }
      
      console.log('📤 Sending success response:', responseData);
      return res.status(200).json(responseData);
      
    } else {
      console.error(`❌ Failed to send email to: ${email}`, emailResult);
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
        success: false,
        isSuccess: false
      });
    }
    
  } catch (error) {
    console.error("❌ Mobile forgot password error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      isSuccess: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin forgot password with email
export const adminForgotPassword = async (req, res) => {
  console.log('=== ADMIN FORGOT PASSWORD REQUEST ===');
  console.log('Body:', req.body);
  
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    console.log(`📧 Admin password reset requested for: ${email}`);

    // Check if admin exists
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: "If this admin email exists, a reset code has been sent",
        success: true,
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
      console.log(`✅ Admin reset email sent successfully to: ${email}`);
      return res.status(200).json({
        message: "Admin reset code sent to your email",
        success: true,
        isSuccess: true,
        expiresIn: "15 minutes",
        // Return code only in development
        resetCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
      });
    } else {
      console.error(`❌ Failed to send admin email to: ${email}`);
      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
        success: false,
        isSuccess: false
      });
    }
  } catch (error) {
    console.error("❌ Admin forgot password error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      isSuccess: false
    });
  }
};

// Enhanced validateToken function
export const validateToken = async (req, res) => {
  console.log('=== TOKEN VALIDATION REQUEST ===');
  console.log('Body:', req.body);
  
  try {
    const { token, type = 'mobile' } = req.body;

    console.log(`🔍 Token validation requested - Type: ${type}`);
    console.log(`🔑 Token preview: ${token ? token.substring(0, 10) + '...' : 'undefined'}`);

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({
        message: "Token is required",
        success: false,
        isSuccess: false
      });
    }

    // Use the same validation logic as resetPassword
    console.log('🔍 Validating token...');
    const resetRecord = await PasswordReset.validateToken(token, type);
    
    // If we reach here, token is valid
    console.log(`✅ Token validation successful for: ${resetRecord.email}`);
    
    return res.status(200).json({
      message: "Token is valid",
      success: true,
      isSuccess: true,
      email: resetRecord.email
    });
    
  } catch (error) {
    // Clean error logging
    if (error.message.includes("Invalid") || error.message.includes("expired")) {
      console.log(`❌ Token validation failed: ${error.message}`);
      return res.status(400).json({
        message: error.message,
        success: false,
        isSuccess: false
      });
    }
    
    // Only log full error for unexpected issues
    console.error("❌ Unexpected token validation error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      isSuccess: false
    });
  }
};

// Enhanced reset password function
export const resetPassword = async (req, res) => {
  console.log('=== RESET PASSWORD REQUEST ===');
  console.log('Body:', { ...req.body, newPassword: '***' }); // Hide password in logs
  
  try {
    const { token, newPassword, type = 'mobile' } = req.body;

    console.log(`🔄 Password reset attempt - Type: ${type}`);

    if (!token || !newPassword) {
      console.log('❌ Missing token or password');
      return res.status(400).json({
        message: "Token and new password are required",
        success: false,
        isSuccess: false
      });
    }

    // Validate token/code
    console.log('🔍 Validating reset token...');
    const resetRecord = await PasswordReset.validateToken(token, type);
    console.log(`✅ Token valid for: ${resetRecord.email}`);
    
    // Hash new password
    const saltRounds = type === 'admin' ? 12 : 10;
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password based on type
    if (type === 'admin') {
      const admin = await Admin.findOne({ email: resetRecord.email });
      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
          success: false,
          isSuccess: false
        });
      }
      
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✅ Admin password updated for: ${resetRecord.email}`);
    } else {
      const user = await User.findOne({ email: resetRecord.email });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
          isSuccess: false
        });
      }
      
      user.password = hashedPassword;
      await user.save();
      console.log(`✅ User password updated for: ${resetRecord.email}`);
    }

    // Mark token as used
    console.log('🔒 Marking token as used...');
    await resetRecord.markAsUsed();

    console.log('✅ Password reset completed successfully');
    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
      isSuccess: true
    });
    
  } catch (error) {
    // Clean error logging
    if (error.message.includes("Invalid") || error.message.includes("expired")) {
      console.log(`❌ Password reset failed: ${error.message}`);
      return res.status(400).json({
        message: error.message,
        success: false,
        isSuccess: false
      });
    }
    
    // Only log full error for unexpected issues
    console.error("❌ Unexpected reset password error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      isSuccess: false
    });
  }
};

// Cleanup expired tokens
export const manualCleanup = async (req, res) => {
  try {
    const expiredCount = await PasswordReset.cleanupExpired();
    
    return res.status(200).json({
      message: `Cleanup completed. ${expiredCount} tokens marked as expired`,
      success: true,
      isSuccess: true,
      expiredCount
    });
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      isSuccess: false
    });
  }
};

// Get reset statistics
export const getResetStats = async (req, res) => {
  try {
    const stats = await PasswordReset.getStats();
    
    return res.status(200).json({
      success: true,
      isSuccess: true,
      stats
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      isSuccess: false
    });
  }
};