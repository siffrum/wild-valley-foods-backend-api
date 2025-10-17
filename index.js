import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./MainRoute/mainRoutes.js";
import { dbConnection } from "./db/dbconnection.js";

dotenv.config();
const app = express();

// ✅ CORS configuration (must come before routes)
const allowedOrigin = "https://wvf.onrender.com";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "targetapitype", 
      "isdeveloperapk",
    ],
  })
);

// ✅ Handle OPTIONS preflight explicitly
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, targetapitype"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// ✅ Body parsers
app.use(express.json({ limit: "50mb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Register all routes
registerRoutes(app, process.env.BASE_URL);

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ✅ Start server after DB connection
const startServer = async () => {
  try {
    const { sequelize, models } = await dbConnection();
    console.log("✅ DB connected, starting server...");

    app.use((req, res, next) => {
      req.models = models;
      next();
    });

    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (ENV=${process.env.NODE_ENV || "development"})`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
