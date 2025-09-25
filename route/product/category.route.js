import express from "express";
import {
  createCategory, updateCategory, deleteCategory,
  getAllCategories, getCategoryById, getAllCategoriesPaginated, getCategoryCount
} from "../../controller/product/category.controller.js";
import authenticate from "../../middlewares/auth/auth.js";
import { uploadCategory } from "../../Helper/multer.helper.js";

const router = express.Router();

// Public
router.get('/categories/paginated', getAllCategoriesPaginated);
router.get('/categories', getAllCategories);
router.get('/categories/count', getCategoryCount);
router.get('/categoryById/:id', getCategoryById);

// Admin
router.post('/admin/createcategory', authenticate, (req, res, next) => { req.uploadFolder = "category-icons"; next(); }, uploadCategory.single("category_icon"), createCategory);
router.put('/admin/updatecategoryById/:id', authenticate, (req, res, next) => { req.uploadFolder = "category-icons"; next(); }, uploadCategory.single("category_icon"), updateCategory);
router.delete('/admin/deletecategoryById/:id', authenticate, deleteCategory);

export default router;
