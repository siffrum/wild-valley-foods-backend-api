import { Testimonial } from "../../db/dbconnection.js";
import { sendError, sendSuccess } from "../../Helper/response.helper.js";

// ✅ Create Testimonial (Admin Only)
export const createTestimonial = async (req, res) => {
  try {
    // if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? req.body.reqData : {};
    if (!reqData.name?.trim()) return sendError(res, "Name is required", 400);

     reqData.createdBy = req.user ? req.user.id : null;
    reqData.lastModifiedBy = req.user ? req.user.id : null;

    const testimonial = await Testimonial.create(reqData);

    return sendSuccess(
      res,
      {
        ...testimonial.toJSON(),
        responseMessage: "Testimonial created successfully",
      },
      201
    );
  } catch (err) {
    console.error("❌ CREATE TESTIMONIAL ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Update Testimonial (Admin Only)
export const updateTestimonial = async (req, res) => {
  try {
    // if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? req.body.reqData : {};
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return sendError(res, "Testimonial not found", 404);

  reqData.lastModifiedBy = req.user ? req.user.id : null;
    await testimonial.update(reqData);

    return sendSuccess(res, {
      ...testimonial.toJSON(),
      responseMessage: "Testimonial updated successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE TESTIMONIAL ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get All Testimonials (Paginated)
export const getAllTestimonials = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Testimonial.findAndCountAll({
      offset: skip,
      limit: top,
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, {
      items,
      intResponse: total,
      responseMessage: "Testimonials fetched successfully",
      skip,
      top,
    });
  } catch (err) {
    console.error("❌ GET ALL TESTIMONIALS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Testimonial By ID
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return sendError(res, "Testimonial not found", 404);

    return sendSuccess(res, {
      ...testimonial.toJSON(),
      responseMessage: "Testimonial fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET TESTIMONIAL ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Testimonial Count
export const getTestimonialCount = async (req, res) => {
  try {
    const total = await Testimonial.count();
    return sendSuccess(res, {
      intResponse: total,
      responseMessage: "Total testimonial count fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET TESTIMONIAL COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Delete Testimonial (Admin Only)
export const deleteTestimonial = async (req, res) => {
  try {
    // if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403); 

    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return sendError(res, "Testimonial not found", 404);

    await testimonial.destroy();

    return sendSuccess(res, {
      boolResponse: true,
      responseMessage: "Testimonial deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE TESTIMONIAL ERROR:", err);
    return sendError(res, err.message);
  }
};
