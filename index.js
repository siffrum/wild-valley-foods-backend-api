import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./MainRoute/mainRoutes.js";
import { dbConnection } from "./db/dbconnection.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "https://wildvalleyfoods.in",
      "https://www.wildvalleyfoods.in"
    ],
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    credentials: true,
  })
);

app.options("*", cors());

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
