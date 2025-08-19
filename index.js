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
import adminProduct from './route/product/adminProduct.route.js';
import bodyParser from 'body-parser';

const app = express();
// Increase the body size limit (50MB is safe for base64 images)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: "*",
  })
);
// Middleware
app.use(express.json());

app.use(cookie());
//Routes
app.use(process.env.BASE_URL, router);

app.use(`${process.env.BASE_URL}/license`, licenseRouter);
app.use(`${process.env.BASE_URL}/module`, moduleRouter);
app.use(`${process.env.BASE_URL}/banner`, bannerRoute);
app.use(`${process.env.BASE_URL}`, category);
app.use(`${process.env.BASE_URL}/product`, product);         // public routes
app.use(`${process.env.BASE_URL}/admin/product`, adminProduct); // admin routes


//Local  Database connection
// dbConnection(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS);

// Production database connection
dbConnection();

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});

