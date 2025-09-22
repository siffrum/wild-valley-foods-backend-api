import express from "express";
import {
  getAllReviews,
  getReviewById,
  createReviewForProduct,
  getPaginatedReviewsForProduct,
  getAverageRatingForProduct
} from "../../controller/product/review.controller.js";

const router = express.Router();

// Public
router.get("/paginated", getAllReviews); // paginated
router.get("/:id", getReviewById);
router.get("/GetAllProductreviewsByProductId/:productId", getPaginatedReviewsForProduct);

router.get("/product/average-rating/:productId", getAverageRatingForProduct);
router.post("/CreateProductReviewByProductId/:productId", createReviewForProduct);

export default router;
