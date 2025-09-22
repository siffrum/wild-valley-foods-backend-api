import { Review, Product, User } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import sequelize from "sequelize";

const { fn, col } = sequelize;

// ✅ Get All Reviews (Paginated)
export const getAllReviews = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Review.findAndCountAll({
      offset: skip,
      limit: top,
      include: [
        { model: Product, as: "product" },
      ],
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, {
      items,
      intResponse: total,
      responseMessage: "Reviews fetched successfully",
      skip,
      top,
    });
  } catch (err) {
    console.error("❌ GET ALL REVIEWS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Review By ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{ model: Product, as: "product" }],
    });

    if (!review) return sendError(res, "Review not found", 404);

    return sendSuccess(res, {
      ...review.toJSON(),
      responseMessage: "Review fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET REVIEW ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Average Rating of a Product
export const getAverageRatingForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) return sendError(res, "Product not found", 404);

    const result = await Review.findOne({
      where: { productId },
      attributes: [[fn("AVG", col("rating")), "averageRating"]],
      raw: true,
    });

    const averageRating = parseFloat(result?.averageRating) || 0;

    return sendSuccess(res, {
      productId,
      intResponse: averageRating,
      responseMessage: "Average rating calculated successfully",
    });
  } catch (err) {
    console.error("❌ GET AVERAGE RATING ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Create Review for a Product
// ✅ Create Review for a Product
export const createReviewForProduct = async (req, res) => {
  try {
    const reqData = req.body.reqData ? req.body.reqData : {};
    const { productId } = req.params;

    if (!reqData.name?.trim()) return sendError(res, "Name is required", 400);
    if (!reqData.email?.trim()) return sendError(res, "Email is required", 400);
    if (!reqData.rating) return sendError(res, "Rating is required", 400);
    if (!reqData.comment?.trim()) return sendError(res, "Comment is required", 400);

    const numericRating = Number(reqData.rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return sendError(res, "Rating must be a number between 1 and 5", 400);
    }

    // ✅ Check product existence
    const product = await Product.findByPk(productId);
    if (!product) return sendError(res, "Product not found", 404);

    // ✅ Prevent duplicate review from the same email for the same product
    const existingReview = await Review.findOne({
      where: { productId, email: reqData.email },
    });
    if (existingReview) {
      return sendError(res, "You have already submitted a review for this product", 400);
    }

    reqData.productId = productId;
    reqData.rating = numericRating;
    reqData.createdBy = req.user ? req.user.id : null;
    reqData.lastModifiedBy = req.user ? req.user.id : null;

    const review = await Review.create(reqData);

    return sendSuccess(
      res,
      {
        ...review.toJSON(),
        responseMessage: "Review created successfully",
      },
      201
    );
  } catch (err) {
    console.error("❌ CREATE REVIEW ERROR:", err);
    return sendError(res, err.message);
  }
};


// ✅ Update Review (Admin Only)
export const updateReview = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? req.body.reqData : {};
    const review = await Review.findByPk(req.params.id);
    if (!review) return sendError(res, "Review not found", 404);

    reqData.lastModifiedBy = req.user.id;
    await review.update(reqData);

    return sendSuccess(res, {
      ...review.toJSON(),
      responseMessage: "Review updated successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE REVIEW ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Paginated Reviews for a Product
export const getPaginatedReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Review.findAndCountAll({
      where: { productId },
      offset: skip,
      limit: top,
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, {
      items,
      intResponse: total,
      responseMessage: "Product reviews fetched successfully",
      skip,
      top,
    });
  } catch (err) {
    console.error("❌ GET PRODUCT REVIEWS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Paginated Reviews (All)
export const getPaginatedReviews = async (req, res) => {
  try {
    let { skip = 0, limit = 10 } = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    const { rows, count } = await Review.findAndCountAll({
      offset: skip,
      limit: limit,
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, {
      data: rows,
      intResponse: count,
      responseMessage: "Paginated reviews fetched successfully",
      skip,
      limit,
    });
  } catch (err) {
    console.error("❌ GET PAGINATED REVIEWS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Review Count
export const getReviewCount = async (req, res) => {
  try {
    const total = await Review.count();
    return sendSuccess(res, {
      intResponse: total,
      responseMessage: "Total review count fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET REVIEW COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Delete Review (Admin Only)
export const deleteReview = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const review = await Review.findByPk(req.params.id);
    if (!review) return sendError(res, "Review not found", 404);

    await review.destroy();

    return sendSuccess(res, {
      boolResponse: true,
      responseMessage: "Review deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE REVIEW ERROR:", err);
    return sendError(res, err.message);
  }
};
