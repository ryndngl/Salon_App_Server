// src/controllers/forgotPasswordController.js
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

// FORGOT PASSWORD FUNCTION
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    console.log('✅ User found:', user.email);

    // Delete any existing tokens for this email (cleanup)
    await PasswordReset.deleteMany({ email: email.toLowerCase() });

    // Generate raw token and hashed token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log('🔑 Generated token for:', email);

    // Save hashed token
    await PasswordReset.create({
      email: email.toLowerCase(),
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
    });

    console.log('💾 Token saved to database');

    // Setup email transporter - FIXED: createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('📮 Setting up email transporter...');

    // Create multiple URL formats for better compatibility
    const resetURL = `exp://192.168.100.6:19000/--/reset-password?token=${resetToken}`;
    const universalLink = `https://salonapp.page.link/reset?token=${resetToken}`;
    const customSchemeURL = `salonmobileapp://reset-password?token=${resetToken}`;
    
    // Simple HTTP redirect URL (most reliable)
    const webRedirectURL = `http://192.168.100.6:5000/redirect-to-app?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - Salon Booking App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #d13f3f; margin: 0; font-size: 24px;">Password Reset Request</h2>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.5;">Hi there!</p>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">
              You requested a password reset for your Salon Booking App account.
            </p>
            
            <!-- Main Reset Button - FIXED VERSION -->
            <div style="text-align: center; margin: 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4CAF50, #45a049); border-radius: 8px; padding: 0;">
                    <a href="${webRedirectURL}" 
                       style="display: inline-block; 
                              color: white; 
                              padding: 18px 40px; 
                              text-decoration: none; 
                              font-size: 18px; 
                              font-weight: bold;
                              border-radius: 8px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Alternative Button for Custom Scheme -->
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                If the button above doesn't work, try this:
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: #d13f3f; border-radius: 8px; padding: 0;">
                    <a href="${customSchemeURL}" 
                       style="display: inline-block; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              font-size: 16px; 
                              font-weight: bold;
                              border-radius: 8px;">
                      Open in App
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Manual Token Section -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #333; margin-top: 0; font-size: 16px;">Manual Token Entry:</h3>
              <p style="color: #666; font-size: 14px; margin: 10px 0;">
                If neither button works, copy this token and paste it in the app:
              </p>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <code style="font-family: 'Courier New', monospace; 
                             font-size: 12px; 
                             color: #d13f3f; 
                             font-weight: bold; 
                             word-break: break-all; 
                             display: block; 
                             text-align: center;">
                  ${resetToken}
                </code>
              </div>
              <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                Open app → Forgot Password → "I have a reset token" → Paste token
              </p>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0; font-size: 14px;">Instructions:</h4>
              <ol style="color: #666; font-size: 13px; line-height: 1.4; margin: 5px 0; padding-left: 20px;">
                <li>Make sure Expo Go app is installed on your phone</li>
                <li>Click the first "Reset My Password" button</li>
                <li>If that doesn't work, try the "Open in App" button</li>
                <li>As backup, copy the token and paste it manually in the app</li>
              </ol>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="color: #856404; font-size: 12px; margin: 0; line-height: 1.4;">
                <strong>Security Notice:</strong><br>
                • This link expires in 1 hour<br>
                • If you didn't request this, ignore this email<br>
                • Never share this token with anyone
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 11px; margin: 0;">
                Salon Booking App • This email was sent to ${email}
              </p>
            </div>
          </div>
        </div>
      `,
    };

    console.log('📤 Sending email...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');

    res.json({
      success: true,
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message // for debugging
    });
  }
};

// RESET PASSWORD FUNCTION - MISSING FUNCTION!
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log('🔄 Reset password attempt with token');

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

    // Hash the provided token to match with database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log('🔍 Looking for token in database...');

    // Find the token in database
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }, // Check if not expired
    });

    if (!resetRecord) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    console.log('✅ Valid token found for:', resetRecord.email);

    // Find the user
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Delete the used token
    await PasswordReset.deleteMany({ email: resetRecord.email });

    console.log('✅ Password reset successful for:', user.email);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message // for debugging
    });
  }
};