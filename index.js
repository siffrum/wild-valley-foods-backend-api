import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import cookie from "cookie-parser";
import { registerRoutes } from "./MainRoute/mainRoutes.js";
import { dbConnection } from "./db/dbconnection.js";

const app = express();

// ✅ Body parsers
app.use(express.json({ limit: "50mb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Full CORS fix for frontend with custom headers
app.use(cors({
  origin: 'https://wvf.onrender.com',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: "*", // Allow all headers including custom ones
}));

// ✅ Handle OPTIONS preflight requests
app.options('*', cors({
  origin: 'https://wvf.onrender.com',
  credentials: true,
}));

// Middleware
app.use(cookie());
// ✅ Register all routes via single function
registerRoutes(app, process.env.BASE_URL);

// ⚡ Start server only after DB connection
const startServer = async () => {
  try {
    const { sequelize, models } = await dbConnection();
    console.log("✅ DB connected, starting server...");

    // Optional: attach models to req
    app.use((req, res, next) => {
      req.models = models;
      next();
    });

    // Razorpay example (commented)
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_R99agg2nuIaA5n",
    //   key_secret: process.env.RAZORPAY_KEY_SECRET || "NQHte2R5i5nVFQlA1HliCF0r"
    // });
    // app.get("/", (req, res) => {
    //   res.send("Hello, world!");
    // });
    // app.post("/create-payment-link", async (req, res) => { ... });

    // app.post('/api/webhook', express.json(), (req, res) => { ... });

    // Start the server

    // const options = {
    //   key: fs.readFileSync("server.key"),
    //   cert: fs.readFileSync("server.cert"),
    // };
    // https.createServer(options, app).listen(5000, () => { ... });

    app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

    // Use a default port if not provided
    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
