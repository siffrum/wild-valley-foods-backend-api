import express from 'express';
import { createProduct, updateProduct, deleteProduct,getProductCount } from '../../controller/product/product.controller.js';

const router = express.Router();
import authenticate from '../../middlewares/auth/auth.js';
// Admin-only routes
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
