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
// import razorpay from "razorpay";
import fs from "fs";
import https from "https";

const app = express();

// ✅ Use built-in Express body parsers (no body-parser)
app.use(express.json({ limit: "50mb", strict: false })); // strict:false lets "null" pass if sent
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: "*",
  })
);

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

// Local Database connection
// dbConnection(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS);

// Production database connection
dbConnection();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_R99agg2nuIaA5n",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "NQHte2R5i5nVFQlA1HliCF0r"
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

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
