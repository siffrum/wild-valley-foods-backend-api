import { Banner } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import { convertImageToBase64, deleteFileSafe } from "../../Helper/multer.helper.js";
import path from "path";  // ✅ make sure this is at the top


export const createBanner = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.createdBy = req.user.id;
    reqData.lastModifiedBy = req.user.id;

    // Only set imagePath here if file exists
    if (req.file) {
      reqData.imagePath = req.file.path; 
    } else {
      return sendError(res, "Image is required");
    }

    const banner = await Banner.create(reqData);

    const result = banner.toJSON();
    result.image_base64 = result.imagePath ? convertImageToBase64(result.imagePath) : null;
    return sendSuccess(res, result, 201);

  } catch (err) {
    console.error("❌ CREATE BANNER ERROR:", err);
    return sendError(res, err.message);
  }
};



// ✅ UPDATE BANNER
export const updateBanner = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.createdBy = req.user.id;
    reqData.lastModifiedBy=req.user.id;

    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, "Category not found", 404);

    await banner.update(reqData);

    if (req.file) {
      deleteFileSafe(banner.imagePath);
      banner.imagePath = req.file.path;
      await banner.save();
    }

    const result = banner.toJSON();
    result.image_base64 = result.imagePath ? convertImageToBase64(result.imagePath) : null;
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ UPDATE Banner ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL BANNERS
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();

    const result = banners.map(b => {
      const obj = b.toJSON();
      obj.image_base64 = obj.imagePath ? convertImageToBase64(obj.imagePath) : null;
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET ALL BANNERS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL BANNERS WITH PAGINATION
export const getAllBannersByPagination = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const banners = await Banner.findAll({ offset: skip, limit: top });

    const result = banners.map(b => {
      const obj = b.toJSON();
      obj.image_base64 = obj.imagePath ? convertImageToBase64(obj.imagePath) : null;
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ PAGINATED BANNER FETCH ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET TOTAL COUNT
export const getTotalBannerCount = async (req, res) => {
  try {
    const total = await Banner.count();
    return sendSuccess(res, { intResponse: total, responseMessage: "Total banner count fetched successfully" });
  } catch (err) {
    console.error("❌ GET BANNER COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET BANNER BY ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, "Banner not found", 404);

    const result = banner.toJSON();
    result.image_base64 = result.imagePath ? convertImageToBase64(result.imagePath) : null;

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET BANNER BY ID ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET BANNERS BY TYPE
export const getBannersByType = async (req, res) => {
  try {
    const { type } = req.params;

    const banners = await Banner.findAll({ where: { bannerType: type } });
    if (!banners.length) return sendError(res, "No banners found for this type", 404);

    const result = banners.map(b => {
      const obj = b.toJSON();
      obj.image_base64 = obj.imagePath ? convertImageToBase64(obj.imagePath) : null;
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET BANNERS BY TYPE ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ DELETE BANNER
export const deleteBanner = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, "Banner not found", 404);

    deleteFileSafe(banner.imagePath);
    await Banner.destroy({ where: { id: req.params.id } });

    return sendSuccess(res, null);
  } catch (err) {
    console.error("❌ DELETE BANNER ERROR:", err);
    return sendError(res, err.message);
  }
};
