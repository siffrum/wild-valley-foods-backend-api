import express from "express";
import {
  searchProductsOdata,
  getAllProducts,
  getProductById,
  getAllProductsByOdata,
  getProductCount,
  getNewArrivalProducts,
  getProductsByCategoryId,
  getProductCountByCategoryId
} from "../../controller/product/product.controller.js";

const router = express.Router();

// 🔹 Public Routes
router.get("/search", searchProductsOdata);
router.get("/", getAllProducts);
router.get("/paginated", getAllProductsByOdata);
router.get("/count", getProductCount);   // keep before :id

// 🔹 New Endpoints
router.get("/category/:categoryId", getProductsByCategoryId);
router.get("/new-arrivals", getNewArrivalProducts);
router.get("/category/:categoryId/count", getProductCountByCategoryId);
// 🔹 Must be last (dynamic route)
router.get("/:id", getProductById);

export default router;
