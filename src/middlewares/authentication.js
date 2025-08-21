// Updated authentication.js middleware - Support Bearer token
import jwt from "jsonwebtoken";
import "dotenv/config";
const secret = process.env.secret_key;

const authentication = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // Fallback: Check for token in cookies (existing method)
    if (!token && req.cookies) {
      token = req.cookies.salon_token;
    }

    if (!token) {
      const error = new Error("Unauthenticated - No token provided");
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
    return;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Invalid token", 
        isSuccess: false 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expired", 
        isSuccess: false 
      });
    }

    res.status(error.status || 500).json({ 
      message: error.message, 
      isSuccess: false 
    });
  }
};

export default authentication;