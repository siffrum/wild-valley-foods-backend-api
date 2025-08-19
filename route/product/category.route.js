import express from 'express';
import {
  createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById,getAllCategoriesPaginated, getCategoryCount
} from '../../controller/product/category.controller.js';
import authenticate from '../../middlewares/auth/auth.js';

const router = express.Router();

// Categories
// Public
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);

// Admin
router.post('/admin/categories', authenticate, createCategory);
router.put('/admin/categories/:id', authenticate, updateCategory);
router.delete('/admin/categories/:id', authenticate, deleteCategory);
router.get('/admin/categories/paginated', getAllCategoriesPaginated);    // paginated
router.get('/admin/categories/count', getCategoryCount); 
export default router;