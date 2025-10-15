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
import {
  uploadBanner,
  compressUploadedImage,
} from "../../Helper/multer.helper.js";

const router = express.Router();

// ✅ Banner Routes
router.post(
  "/create",
  authenticateToken,
  (req, res, next) => {
    req.uploadFolder = "Banners";
    next();
  },
  uploadBanner.single("imagePath"),
  compressUploadedImage, // ✅ Compress and convert uploaded banner
  createBanner
);

router.get("/count", getTotalBannerCount);
router.get("/getall", getAllBanners);
router.get("/getall/paginated", getAllBannersByPagination);
router.get("/getbyid/:id", getBannerById);
router.get("/getbytype/:type", getBannersByType);

router.put(
  "/update/:id",
  authenticateToken,
  (req, res, next) => {
    req.uploadFolder = "Banners";
    next();
  },
  uploadBanner.single("imagePath"),
  compressUploadedImage, // ✅ Compress and convert uploaded banner
  updateBanner
);

router.delete("/delete/:id", authenticateToken, deleteBanner);

export default router;
