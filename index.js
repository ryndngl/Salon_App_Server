import express from "express";
const app = express();
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoute from "./src/routes/auth.js";
import homeRoute from "./src/routes/home.js";
// PORT
const PORT = process.env.PORT || 3001;

// database connection
import connect from "./src/config/connection.js";

// middlewares
app.use(express.json());
app.use(cookieParser());

// connect to database
await connect();

// routes
app.use("/api/auth", authRoute);
app.use("/api/home", homeRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
