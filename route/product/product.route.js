import express from 'express';
import { getAllProducts, getProductById,getAllProductsByOdata,getProductCount
} from '../../controller/product/product.controller.js';



const router = express.Router();

// Products
router.get('/', getAllProducts);                       // Public
router.get('/:id', getProductById);                   // Public
router.get('/odata', getAllProductsByOdata); // Public OData
router.get('/count',getProductCount)

export default router;