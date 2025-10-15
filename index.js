import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import cookie from "cookie-parser";
import { dbConnection } from "./db/dbconnection.js";
import router from "./route/auth/auth.routes.js";
import licenseRouter from "./route/License/license.route.js";
import moduleRouter from "./route/License/module.route.js";
import bannerRoute from "./route/websiteResources/banner.route.js";
import category from "./route/product/category.route.js";
import product from "./route/product/product.route.js";
import adminProduct from "./route/product/adminProduct.route.js";
import customer from "./route/customer/customer.route.js";
import contactus from "./route/contact-us/contact-us.route.js";
import webhooks  from "./controller/customer-controller/webhooks.js"; 
import Review  from "./route/product/review.js";
import adminReview from "./route/product/review.admin.js";
import testimonials from "./route/websiteResources/testimonial.route.js";
import video from "./route/websiteResources/video.route.js"; 
import fs from "fs";
import https from "https";

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

    // Routes
    app.use(process.env.BASE_URL, router);
    app.use(`${process.env.BASE_URL}/license`, licenseRouter);
    app.use(`${process.env.BASE_URL}/module`, moduleRouter);
    app.use(`${process.env.BASE_URL}/banner`, bannerRoute);
    app.use(`${process.env.BASE_URL}`, category);
    app.use(`${process.env.BASE_URL}/product`, product); // public routes
    app.use(`${process.env.BASE_URL}/admin/product`, adminProduct); // admin routes
    app.use(`${process.env.BASE_URL}/customer`,customer); // serve customer docs statically
    app.use(`${process.env.BASE_URL}/contactus`,contactus);
    app.use(`${process.env.BASE_URL}/webhooks`,  webhooks);
    app.use(`${process.env.BASE_URL}/review`,  Review);
    app.use(`${process.env.BASE_URL}/AdminReview`,  adminReview);
    app.use(`${process.env.BASE_URL}/testimonial`,  testimonials);
    app.use(`${process.env.BASE_URL}/video`,  video); 

    // Local Database connection
    // dbConnection(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS);

    // Production database connection
    // dbConnection(); // already handled above

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
