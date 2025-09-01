import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoute from "./src/routes/auth.js";
import userRoute from "./src/routes/users.js";
import servicesRoute from "./src/routes/services.js";
import searchRoutes from "./src/routes/search.js";
import favoritesRoute from "./src/routes/favorites.js"; // ADD: favorites route
// REMOVED: import redirectRoutes from "./src/routes/redirect.js";

// Models
import PasswordReset from "./src/models/PasswordReset.js";

// Get __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PORT
const PORT = process.env.PORT || 3001;

// database connection
import connect from "./src/config/connection.js";

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors()); // Add CORS middleware

// Serve static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect to database
await connect();

// routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/services", servicesRoute);
app.use("/api/search", searchRoutes);
app.use("/api/favorites", favoritesRoute); 

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Salon Booking API Server is running!",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      services: "/api/services",
      search: "/api/search",
      favorites: "/api/favorites" 
    }
  });
});

//  Cleanup expired reset tokens every 15 mins (extra safety, aside from TTL index)
setInterval(async () => {
  try {
    const result = await PasswordReset.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired reset tokens`);
    }
  } catch (err) {
    console.error("Error cleaning expired reset tokens:", err);
  }
}, 1000 * 30 * 15); // every 30 minutes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`🚀 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Services: http://localhost:${PORT}/api/services`);
  console.log(`   - Search: http://localhost:${PORT}/api/search`);
  console.log(`   - Favorites: http://localhost:${PORT}/api/favorites`); 
});