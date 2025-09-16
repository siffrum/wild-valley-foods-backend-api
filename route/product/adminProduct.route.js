import express from "express";
import { createProduct, updateProduct, deleteProduct } from "../../controller/product/product.controller.js";
import authenticate from "../../middlewares/auth/auth.js";
import { upload } from "../../Helper/multer.helper.js";

const router = express.Router();

// Admin
router.post("/createproduct", authenticate, (req, res, next) => { req.uploadFolder = "products"; next(); }, upload.array("images", 10), createProduct);
router.put("/updateproductById/:id", authenticate, (req, res, next) => { req.uploadFolder = "products"; next(); }, upload.array("images", 10), updateProduct);
router.delete("/deleteproductById/:id", authenticate, deleteProduct);

export default router;
