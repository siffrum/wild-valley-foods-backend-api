import express from 'express';
import {
  createBanner,
  getAllBanners,
  getBannerById,
  getBannersByType,
  updateBanner,
  deleteBanner,
    getTotalBannerCount
} from '../../controller/website-resources/banner.controller.js';
import { authenticateToken } from "../../middlewares/auth/auth.js";

const router = express.Router();

// Middleware: Protected Routes
router.post('/create', authenticateToken, createBanner);
router.get('/getall', getAllBanners);
router.get('/getbyid/:id', getBannerById);
router.get('/getbytype/:type', getBannersByType);
router.put('/update/:id', authenticateToken, updateBanner);
router.delete('/delete/:id', authenticateToken, deleteBanner);
router.get('/count',authenticateToken, getTotalBannerCount);

export default router;
