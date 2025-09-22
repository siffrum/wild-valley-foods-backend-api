import express from "express";
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialCount,
} from "../../controller/website-resources/testimonial.controller.js";
const router = express.Router();

// Public
router.get("/paginated", getAllTestimonials);
router.get("/count", getTestimonialCount);
router.get("/:id", getTestimonialById);

// Create / Manage
router.post("/create", createTestimonial);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
