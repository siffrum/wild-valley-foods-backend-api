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
import { upload } from "../../Helper/multer.helper.js";

const router = express.Router();


// ✅ Routes
router.post("/create", authenticateToken, (req, res, next) => { req.uploadFolder = "Banners"; next(); }, upload.single("image"), createBanner);
router.get("/count", getTotalBannerCount);
router.get("/getall", getAllBanners);
router.get("/getall/paginated", getAllBannersByPagination);
router.get("/getbyid/:id", getBannerById);
router.get("/getbytype/:type", getBannersByType);
router.put("/update/:id", authenticateToken, upload.single("image"), updateBanner);
router.delete("/delete/:id", authenticateToken, deleteBanner);

export default router;
