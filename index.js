import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoute from "./src/routes/auth.js";
import userRoute from "./src/routes/users.js"; 
import servicesRoute from "./src/routes/services.js";
import searchRoutes from "./src/routes/search.js";


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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect to database
await connect();

// routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/services", servicesRoute); 
app.use("/api/search", searchRoutes); //

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});