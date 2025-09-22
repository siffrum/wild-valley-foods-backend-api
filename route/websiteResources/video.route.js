import express from "express";
import {
  createVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideoCount,
  getPaginatedVideos, // 👈 new
} from "../../controller/website-resources/video.controller.js";
import authenticate from "../../middlewares/auth/auth.js";

const router = express.Router();

// Public
router.get("/", getAllVideos);                // all videos
router.get("/paginated", getPaginatedVideos); // paginated
router.get("/count", getVideoCount);          // count
router.get("/:id", getVideoById);

// Admin / CRUD
router.post("/",authenticate, createVideo);
router.put("/:id",authenticate, updateVideo);
router.delete("/:id",authenticate, deleteVideo);

export default router;
