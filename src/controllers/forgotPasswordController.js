// src/controllers/forgotPasswordController.js - FIXED VERSION
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetRateLimit } from "../middlewares/rateLimiter.js";

// Helper function to get real IP address
const getRealIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         'unknown';
};

// FIXED: Forgot password - DO NOT reset rate limit here
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = getRealIP(req);
    const userAgent = req.headers['user-agent'] || null;

    console.log('📧 Forgot password request:', { email, ip: ipAddress });

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if user exists (security: always respond same way)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('⚠️ Password reset attempt for non-existent user:', email);
      
      // Security: Don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive a reset token shortly",
      });
    }

    console.log('✅ User found:', user.email);

    // Clean up old tokens and create new one
    const { resetToken } = await PasswordReset.createResetToken(
      email.toLowerCase(), 
      ipAddress, 
      userAgent
    );

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enhanced email template
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Salon Booking App",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
          <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
            
            <!-- Header -->
            <div style="background: #2c3e50; padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Salon Booking App</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              
              <p style="color: #495057; font-size: 16px; margin: 0 0 25px 0;">
                Hello,
              </p>
              
              <p style="color: #495057; font-size: 16px; margin: 0 0 25px 0;">
                We received a request to reset your password for your Salon Booking App account. Please use the verification code below to proceed with resetting your password.
              </p>
              
              <!-- Token Container -->
              <div style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: #495057; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</h3>
                
                <div style="background: white; border-radius: 6px; padding: 20px; margin: 15px 0; border: 1px solid #dee2e6;">
                  <code style="font-family: 'Courier New', monospace; 
                               font-size: 18px; 
                               color: #2c3e50; 
                               font-weight: 700; 
                               word-break: break-all; 
                               display: block; 
                               line-height: 1.4;
                               letter-spacing: 2px;">
                    ${resetToken}
                  </code>
                </div>
                
                <p style="color: #6c757d; font-size: 12px; margin: 15px 0 0 0;">
                  Copy and paste this code in the password reset form
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background: #f8f9fa; border-left: 4px solid #2c3e50; padding: 20px; margin: 30px 0;">
                <h4 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">How to reset your password:</h4>
                <ol style="color: #495057; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Open the Salon Booking App</li>
                  <li style="margin-bottom: 8px;">Navigate to the "Reset Password" page</li>
                  <li style="margin-bottom: 8px;">Enter your email address: <strong>${email}</strong></li>
                  <li style="margin-bottom: 8px;">Copy and paste the verification code above</li>
                  <li>Create your new password</li>
                </ol>
              </div>
              
              <!-- Important Notice -->
              <div style="border: 1px solid #dc3545; background: #f8d7da; padding: 20px; margin: 30px 0; border-radius: 6px;">
                <h4 style="color: #721c24; margin: 0 0 12px 0; font-size: 15px; font-weight: 600;">Important Security Information</h4>
                <ul style="color: #721c24; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">This code expires in 15 minutes from the time it was sent</li>
                  <li style="margin-bottom: 6px;">The code can only be used once</li>
                  <li style="margin-bottom: 6px;">Never share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <!-- Timestamp Info -->
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #e9ecef; border-radius: 6px;">
                <p style="margin: 0; font-size: 14px; color: #6c757d;">
                  <strong>Code generated:</strong> ${new Date().toLocaleString()}<br>
                  <strong>Expires:</strong> ${new Date(Date.now() + 900000).toLocaleString()}
                </p>
              </div>
              
              <p style="color: #495057; font-size: 16px; margin: 30px 0 0 0;">
                If you have any questions or need assistance, please contact our support team.
              </p>
              
              <p style="color: #495057; font-size: 16px; margin: 15px 0 0 0;">
                Best regards,<br>
                <strong>Salon Booking App Team</strong>
              </p>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #6c757d; padding: 20px; text-align: center; color: #ffffff;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                This email was sent to: ${email}<br>
                Salon Booking App - Secure Password Reset Service
              </p>
              <div style="margin-top: 15px; font-size: 12px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
                Request ID: ${Date.now()} | IP: ${ipAddress.substring(0, 8)}***
              </div>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending reset email...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully with 15-min token!');

    // Log the attempt - DO NOT RESET RATE LIMIT HERE
    console.log(`📊 Reset request logged:`, {
      email: email.toLowerCase(),
      ip: ipAddress,
      timestamp: new Date().toISOString(),
      attempts: req.rateLimitInfo?.emailAttempts || 'N/A',
      remaining: req.rateLimitInfo?.attemptsRemaining || 'N/A'
    });

    // Show accurate attempts remaining
    const attemptsUsed = req.rateLimitInfo?.emailAttempts || 1;
    const attemptsRemaining = Math.max(0, 3 - attemptsUsed);

    res.json({
      success: true,
      message: "Reset token sent! Check your email and use it within 15 minutes.",
      expiresIn: "15 minutes",
      attemptsUsed: attemptsUsed,
      attemptsRemaining: attemptsRemaining
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// FIXED: Reset password - ONLY reset rate limit here after successful password change
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const ipAddress = getRealIP(req);

    console.log('🔄 Password reset attempt from IP:', ipAddress);

    // Input validation
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate token using model method
    let resetRecord;
    try {
      resetRecord = await PasswordReset.validateToken(token);
    } catch (validationError) {
      console.log('❌ Token validation failed:', validationError.message);
      return res.status(400).json({
        success: false,
        message: validationError.message,
        type: "INVALID_TOKEN"
      });
    }

    console.log('✅ Valid token found for:', resetRecord.email);

    // Find the user
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      console.log('❌ User not found for email:', resetRecord.email);
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Hash the new password
    const saltRounds = 13;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Mark token as used
    await resetRecord.markAsUsed();

    // FIXED: Only NOW reset rate limit after successful password reset
    try {
      await resetRateLimit(resetRecord.email.toLowerCase(), 'email');
      console.log('✅ Rate limit reset after successful password reset for:', resetRecord.email);
    } catch (rateLimitError) {
      console.log('⚠️ Could not reset rate limit:', rateLimitError.message);
    }

    // Auto-cleanup expired tokens
    try {
      await PasswordReset.autoCleanup();
    } catch (cleanupError) {
      console.log('⚠️ Auto cleanup warning:', cleanupError.message);
    }

    console.log('🎉 Password reset successful for:', user.email);

    res.json({
      success: true,
      message: "Password reset successfully! You can now login with your new password.",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enhanced cleanup with better error handling
export const cleanupExpiredTokens = async (req, res) => {
  try {
    const deletedCount = await PasswordReset.autoCleanup();
    
    res.json({
      success: true,
      message: `Cleanup completed. Removed ${deletedCount} expired tokens.`,
      deletedCount
    });
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Cleanup failed",
      error: error.message
    });
  }
};

// Manual cleanup endpoint for admin
export const manualCleanup = async (req, res) => {
  try {
    const { olderThan = 7, includeUsed = true, includeExpired = true } = req.body;
    
    const deletedCount = await PasswordReset.manualCleanup({
      olderThan,
      includeUsed,
      includeExpired
    });
    
    res.json({
      success: true,
      message: `Manual cleanup completed. Removed ${deletedCount} records.`,
      deletedCount
    });
  } catch (error) {
    console.error("❌ Manual cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Manual cleanup failed",
      error: error.message
    });
  }
};

// Get password reset statistics
export const getResetStats = async (req, res) => {
  try {
    const stats = await PasswordReset.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stats",
      error: error.message
    });
  }
};