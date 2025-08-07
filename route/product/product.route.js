import express from 'express';
import {
  createProduct, updateProduct, deleteProduct, getAllProducts, getProductById,getAllProductsByOdata
} from '../../controller/product/product.controller.js';

import authenticate from '../../middlewares/auth/auth.js';

const router = express.Router();

// Products
router.get('/products', getAllProducts);                       // Public
router.get('/products/:id', getProductById);                   // Public
router.post('/admin', authenticate, createProduct);   // Admin
router.put('/admin/products/:id', authenticate, updateProduct);   // Admin
router.delete('/admin/products/:id', authenticate, deleteProduct); // Admin
router.get('/products/odata', getAllProductsByOdata); // Public OData

export default router;