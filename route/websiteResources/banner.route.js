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
compressUploadedBannerImage,
} from "../../Helper/multer.helper.js";

const router = express.Router();

// Create Banner
router.post(
"/create",
authenticateToken,
(req, res, next) => {
req.uploadFolder = "uploads/Banners";
next();
},
uploadBanner.single("imagePath"),
compressUploadedBannerImage, // separate banner compressor
createBanner
);

router.get("/count", getTotalBannerCount);
router.get("/getall", getAllBanners);
router.get("/getall/paginated", getAllBannersByPagination);
router.get("/getbyid/:id", getBannerById);
router.get("/getbytype/:type", getBannersByType);

// Update Banner
router.put(
"/update/:id",
authenticateToken,
(req, res, next) => {
req.uploadFolder = "uploads/Banners";
next();
},
uploadBanner.single("imagePath"),
compressUploadedBannerImage, // separate banner compressor
updateBanner
);

router.delete("/delete/:id", authenticateToken, deleteBanner);

export default router;