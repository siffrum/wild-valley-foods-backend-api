import express from 'express';
import {
  createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById
} from '../../controller/product/category.controller.js';
import authenticate from '../../middlewares/auth/auth.js';

const router = express.Router();

// Categories
router.get('/categories', getAllCategories);                    // Public
router.get('/categories/:id', getCategoryById);                // Public
router.post('/admin/categories', authenticate, createCategory); // Admin
router.put('/admin/categories/:id', authenticate, updateCategory); // Admin
router.delete('/admin/categories/:id', authenticate, deleteCategory); // Admin


export default router;