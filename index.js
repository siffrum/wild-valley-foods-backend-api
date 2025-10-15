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
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "targetapitype" // custom header
  ],
}));

// Middleware
app.use(cookie());

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
dbConnection();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_R99agg2nuIaA5n",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "NQHte2R5i5nVFQlA1HliCF0r"
// });
// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });
// // Route
// app.post("/create-payment-link", async (req, res) => {
//   const { amount, currency, customer, reference_id, notes } = req.body;
//   try {
//     const response = await razorpay.paymentLink.create({
//       amount: amount * 100, // paise
//       currency: currency || "INR",
//       customer: {
//         name: customer.name,
//         email: customer.email,
//         contact: customer.contact,
//       },
//       notify: { sms: true, email: true },
//       reference_id,
//       notes,
//       callback_url: "https://yourdomain.com/payment/success",
//       callback_method: "get",
//     });
//     res.json({ payment_link: response.short_url, id: response.id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/api/webhook', express.json(), (req, res) => {
//   const event = req.body.event;

//   if (event === 'payment_link.paid') {
//     const paymentLinkId = req.body.payload.payment_link.entity.id;
//     const paymentId = req.body.payload.payment.entity.id;
//     // Find your local order by PaymentLinkId, update status to paid,
//     // Save payment details from webhook payload for reconciliation.
//   }

//   res.status(200).send('ok');
// });

// Start the server

// const options = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };

// https.createServer(options, app).listen(5000, () => {
//   console.log("✅ HTTPS Server running at https://localhost:5000");
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server is running at port ${process.env.PORT}`);
// });
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Use a default port if not provided
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
});