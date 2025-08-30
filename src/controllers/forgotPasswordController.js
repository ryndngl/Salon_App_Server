// src/controllers/forgotPasswordController.js
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

// FORGOT PASSWORD FUNCTION - UPDATED FOR TOKEN-ONLY FLOW
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);

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

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // NEW EMAIL TEMPLATE - PROFESSIONAL MODERN DESIGN
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
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
          <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">SALON BOOKING</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 300;">Password Reset Request</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="color: #2c3e50; font-size: 24px; font-weight: 400; margin: 0 0 20px 0;">Password Reset</h2>
              <p style="color: #5a6c7d; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
                We received a request to reset your password for your Salon Booking App account. Please use the token below to proceed with resetting your password.
              </p>
              
              <!-- Token Container -->
              <div style="background: #f8f9fb; border: 2px solid #e1e8ed; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                <h3 style="color: #2c3e50; font-size: 16px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">Reset Token</h3>
                <div style="background: #ffffff; border: 1px solid #d1d9e0; border-radius: 8px; padding: 20px; margin: 15px 0;">
                  <code style="font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; 
                               font-size: 14px; 
                               color: #e74c3c; 
                               font-weight: 600; 
                               word-break: break-all; 
                               display: block; 
                               line-height: 1.5;
                               letter-spacing: 1px;">
                    ${resetToken}
                  </code>
                </div>
                <p style="color: #7f8fa6; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
                  Select and copy the entire token above
                </p>
              </div>
              
              <!-- Instructions -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; padding: 25px; margin: 25px 0;">
                <h4 style="color: #495057; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Instructions</h4>
                <div style="color: #6c757d; font-size: 14px; line-height: 1.7;">
                  <div style="margin-bottom: 8px;">1. Open the Salon Booking App on your device</div>
                  <div style="margin-bottom: 8px;">2. Navigate to the "Forgot Password" section</div>
                  <div style="margin-bottom: 8px;">3. Enter your email address and tap "Send Reset Link"</div>
                  <div style="margin-bottom: 8px;">4. When prompted, paste the token from above</div>
                  <div style="margin-bottom: 8px;">5. Create your new secure password</div>
                </div>
              </div>
              
              <!-- Security Information -->
              <div style="border-left: 4px solid #ffc107; background: #fffbf0; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h4 style="color: #856404; margin: 0 0 12px 0; font-size: 15px; font-weight: 600;">Security Information</h4>
                <div style="color: #856404; font-size: 13px; line-height: 1.6;">
                  <div style="margin-bottom: 6px;">• This token will expire in 1 hour for your security</div>
                  <div style="margin-bottom: 6px;">• If you did not request this reset, please ignore this email</div>
                  <div style="margin-bottom: 6px;">• Never share this token with anyone</div>
                  <div>• Use this token only in the official Salon Booking App</div>
                </div>
              </div>
              
              <!-- Help Section -->
              <div style="text-align: center; margin: 35px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="color: #6c757d; font-size: 14px; margin: 0; font-weight: 500;">
                  Need assistance? Ensure you're using the latest version of our app.
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #adb5bd; font-size: 12px; margin: 0; line-height: 1.5;">
                This email was sent to ${email}<br>
                Salon Booking App - Secure Password Reset Service
              </p>
              <div style="margin-top: 15px;">
                <span style="color: #dee2e6; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">Confidential</span>
              </div>
            </div>
            
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending email...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');

    res.json({
      success: true,
      message: "Reset token sent to your email successfully",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
};

// RESET PASSWORD FUNCTION - Same as before
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
      error: error.message
    });
  }
};