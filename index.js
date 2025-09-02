// index.js - UPDATED SERVER with Testimonial Routes
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
import favoritesRoute from "./src/routes/favorites.js";
import testimonial from "./src/routes/testimonial.js"; 

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
app.use("/api/testimonials", testimonial); 

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Salon Booking API Server is running!",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      services: "/api/services",
      search: "/api/search",
      favorites: "/api/favorites",
      testimonials: "/api/testimonials" 
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`🚀 API Endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Services: http://localhost:${PORT}/api/services`);
  console.log(`   - Search: http://localhost:${PORT}/api/search`);
  console.log(`   - Favorites: http://localhost:${PORT}/api/favorites`);
  console.log(`   - Testimonials: http://localhost:${PORT}/api/testimonials`);
});