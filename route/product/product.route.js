import express from "express";
import { getAllProducts, getProductById, getAllProductsByOdata, getProductCount } from "../../controller/product/product.controller.js";

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/odata/list", getAllProductsByOdata);
router.get("/count", getProductCount);

export default router;
