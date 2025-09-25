import express from "express";
import {
  createBanner,
  getAllBanners,
  getAllBannersByPagination,
  getBannerById,
  getBannersByType,
  updateBanner,
  deleteBanner,
  getTotalBannerCount,
} from "../../controller/website-resources/banner.controller.js";
import { authenticateToken } from "../../middlewares/auth/auth.js";
import {uploadBanner } from "../../Helper/multer.helper.js";

const router = express.Router();


// ✅ Routes
router.post("/create", authenticateToken, (req, res, next) => { req.uploadFolder = "Banners"; next(); }, uploadBanner.single("imagePath"), createBanner);
router.get("/count", getTotalBannerCount);
router.get("/getall", getAllBanners);
router.get("/getall/paginated", getAllBannersByPagination);
router.get("/getbyid/:id", getBannerById);
router.get("/getbytype/:type", getBannersByType);
router.put("/update/:id", authenticateToken, (req, res, next) => { req.uploadFolder = "Banners"; next(); }, uploadBanner.single("imagePath"), updateBanner);
router.delete("/delete/:id", authenticateToken, deleteBanner);

export default router;
