import express from 'express';
import {
  createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById,getAllCategoriesPaginated, getCategoryCount
} from '../../controller/product/category.controller.js';
import authenticate from '../../middlewares/auth/auth.js';

const router = express.Router();

// Categories
// Public
router.get('/categories/paginated', getAllCategoriesPaginated);   // paginated
router.get('/categories', getAllCategories);
router.get('/categories/count', getCategoryCount); 
router.get('/categoryById/:id', getCategoryById);

// Admin
router.post('/admin/createcategory', authenticate, createCategory);
router.put('/admin/updatecategoryById/:id', authenticate, updateCategory);
router.delete('/admin/deletecategoryById/:id', authenticate, deleteCategory);
export default router;