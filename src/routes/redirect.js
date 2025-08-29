// src/routes/redirect.js

// 🔥 Change 'require' to 'import'
import express from 'express';
const router = express.Router();

// Add this route to handle email redirects
router.get('/redirect-to-app', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Invalid Link</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #d13f3f;">Invalid Reset Link</h2>
          <p>This link is missing required information. Please request a new password reset.</p>
        </body>
      </html>
    `);
  }

  // Create the deep link URLs
  const expoURL = `exp://192.168.100.6:19000/--/reset-password?token=${token}`;
  const customSchemeURL = `salonmobileapp://reset-password?token=${token}`;

  // Return an HTML page that tries multiple methods to open the app
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Opening Salon App...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #FCE4EC, #F3E5F5);
            min-height: 100vh;
            margin: 0;
          }
          .container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .logo { font-size: 48px; margin-bottom: 20px; }
          h2 { color: #d13f3f; margin-bottom: 10px; }
          p { color: #666; line-height: 1.5; margin: 15px 0; }
          .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            transition: transform 0.2s;
          }
          .btn:hover { transform: translateY(-2px); }
          .btn-primary { background: linear-gradient(135deg, #4CAF50, #45a049); }
          .btn-secondary { background: linear-gradient(135deg, #2196F3, #1976D2); }
          .manual-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
          }
          .token {
            background: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            color: #d13f3f;
            margin: 10px 0;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #d13f3f;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">💇‍♀️</div>
          <h2>Opening Salon App...</h2>
          <div class="spinner"></div>
          <p>Attempting to open the app automatically...</p>
                    <div style="margin: 30px 0;">
            <a href="${expoURL}" class="btn btn-primary" onclick="trackClick('expo')">
              Open with Expo Go
            </a>
            <br>
            <a href="${customSchemeURL}" class="btn btn-secondary" onclick="trackClick('custom')">
              Open Salon App
            </a>
          </div>
          <div class="manual-section">
            <h3 style="margin-top: 0; color: #333;">Manual Method:</h3>
            <p style="font-size: 14px;">If the app doesn't open, copy this token:</p>
            <div class="token">${token}</div>
            <p style="font-size: 12px; color: #666;">
              Open app → Forgot Password → "I have a reset token" → Paste token
            </p>
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 30px;">
            Make sure you have the Salon Booking App or Expo Go installed on your device.
          </p>
        </div>
        <script>
          let attemptCount = 0;
          const maxAttempts = 2;
          function trackClick(type) {
            console.log('Button clicked:', type);
          }
          function attemptAppOpen() {
            if (attemptCount >= maxAttempts) return;
                        attemptCount++;
            console.log('Attempt', attemptCount, 'to open app');
            // Try Expo URL first
            setTimeout(() => {
              window.location.href = '${expoURL}';
            }, 1000);
            // Fallback to custom scheme
            setTimeout(() => {
              window.location.href = '${customSchemeURL}';
            }, 2000);
          }
          // Auto-attempt when page loads
          window.onload = function() {
            attemptAppOpen();
          };
          // Handle visibility change (user switched back to browser)
          document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && attemptCount === 1) {
              // User came back to browser, app probably didn't open
              setTimeout(() => {
                document.querySelector('h2').innerHTML = 'App Not Opening?';
                document.querySelector('.spinner').style.display = 'none';
              }, 3000);
            }
          });
        </script>
      </body>
    </html>
  `);
});

// 🔥 Change 'module.exports' to 'export default'
export default router;