import jwt from "jsonwebtoken";
import "dotenv/config";
const secret = process.env.secret_key;

const authentication = async (req, res, next) => {
  try {
    const token = req.cookies.salon_token;
    if (!token) {
      const error = new Error("Unauthenticated");
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
    return;
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message, isSuccess: false });
  }
};

export default authentication;
