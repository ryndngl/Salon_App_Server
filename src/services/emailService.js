// src/services/emailService.js - Complete email service with universal template
import nodemailer from 'nodemailer';
import 'dotenv/config';

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Universal email template - works for both mobile tokens and admin codes
const getUniversalResetEmailTemplate = (resetCode, userEmail, isAdmin = false) => {
  const title = isAdmin ? "Admin Password Reset" : "Password Reset Request";
  const appName = isAdmin ? "Van's Glow Up Salon - Admin" : "Salon Booking App";
  const headerBg = isAdmin ? "#dc2626" : "#2c3e50";
  const codeBg = isAdmin ? "#fef2f2" : "#f8f9fa";
  const codeBorder = isAdmin ? "#fecaca" : "#e9ecef";
  const codeColor = isAdmin ? "#dc2626" : "#2c3e50";
  const greeting = isAdmin ? "Hello Administrator," : "Hello,";
  const expiryText = isAdmin ? "⏰ This code expires in 15 minutes" : "";
  
  return {
    subject: `${title} - ${appName}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          
          <!-- Header -->
          <div style="background: ${headerBg}; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${isAdmin ? "🔐 " : ""}${title}</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${appName}</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            
            <p style="color: #495057; font-size: 16px; margin: 0 0 25px 0;">
              ${greeting}
            </p>
            
            <p style="color: #495057; font-size: 16px; margin: 0 0 25px 0;">
              ${isAdmin ? "A password reset was requested for your admin account. Please use the code below:" : "We received a request to reset your password. Please use the verification code below:"}
            </p>
            
            <!-- Code Container -->
            <div style="background: ${codeBg}; border: 2px solid ${codeBorder}; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
              <h3 style="color: ${codeColor}; font-size: 14px; font-weight: 600; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">${isAdmin ? "Admin Reset Code" : "Verification Code"}</h3>
              
              <div style="background: white; border-radius: 6px; padding: 20px; margin: 15px 0; border: 1px solid ${codeBorder};">
                <code style="font-family: 'Courier New', monospace; 
                             font-size: ${isAdmin ? "32px" : "18px"}; 
                             color: ${codeColor}; 
                             font-weight: 700; 
                             ${isAdmin ? "" : "word-break: break-all;"}
                             display: block; 
                             line-height: 1.4;
                             letter-spacing: ${isAdmin ? "4px" : "2px"};">
                  ${resetCode}
                </code>
              </div>
              
              ${expiryText ? `<p style="color: #ef4444; font-size: 14px; margin: 15px 0 0 0; font-weight: 500;">${expiryText}</p>` : ""}
            </div>
            
            <p style="color: #495057; font-size: 16px; margin: 30px 0 0 0;">
              Best regards,<br>
              <strong>${isAdmin ? "Van's Glow Up Salon Admin Team" : "Salon Booking App Team"}</strong>
            </p>
            
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `
      ${appName} - ${title}
      
      ${greeting}
      
      ${isAdmin ? "A password reset was requested for your admin account." : "We received a request to reset your password."}
      
      Your ${isAdmin ? "reset code" : "verification code"}: ${resetCode}
      
      ${isAdmin ? "This code expires in 15 minutes." : ""}
      
      Best regards,
      ${isAdmin ? "Van's Glow Up Salon Admin Team" : "Salon Booking App Team"}
    `
  };
};

// Send mobile user reset email using universal template
export const sendMobileResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = getUniversalResetEmailTemplate(resetToken, email, false); // false = mobile user
    
    const mailOptions = {
      from: {
        name: "Salon Booking App",
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Mobile reset email sent to: ${email}`);
    console.log(`✅ Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send mobile reset email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

// Send admin reset email using universal template
export const sendAdminResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = getUniversalResetEmailTemplate(resetCode, email, true); // true = admin user
    
    const mailOptions = {
      from: {
        name: "Van's Glow Up Salon - Admin",
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      priority: 'high' // High priority for admin emails
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`🔐 Admin reset email sent to: ${email}`);
    console.log(`✅ Message ID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send admin reset email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return { success: true };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};