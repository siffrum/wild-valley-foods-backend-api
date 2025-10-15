import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getRecentBestSellingProducts,
  updateBestSellingState
} from "../../controller/product/product.controller.js";
import authenticate from "../../middlewares/auth/auth.js";
import {
  upload,
  compressMultipleImages,
} from "../../Helper/multer.helper.js";

const router = express.Router();

// ✅ Admin Routes
router.post(
  "/createproduct",
  authenticate,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 10),
  compressMultipleImages, // ✅ Compress and convert all uploaded images
  createProduct
);

router.put(
  "/updateproductById/:id",
  authenticate,
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 10),
  compressMultipleImages, // ✅ Compress and convert all uploaded images
  updateProduct
);

router.delete("/deleteproductById/:id", authenticate, deleteProduct);

// ✅ NEW: Recently Added 8 Best Selling Products
router.get("/bestselling/recent", getRecentBestSellingProducts);

// ✅ Admin can set best-selling true or false
router.put("/bestselling/state/:id", authenticate, updateBestSellingState);

export default router;
