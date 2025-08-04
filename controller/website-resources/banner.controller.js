import { Banner } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";

// CREATE Banner (Admin Only)
export const createBanner = async (req, res) => {
  try {
    const { reqData } = req.body;

    // Optional: Check user role if needed here
    if (req.user?.role !== 'superAdmin') return sendError(res, "Unauthorized", 403);

    const newBanner = await Banner.create({
      ...reqData,
      createdBy: req.user?.id || null,
    });

    return sendSuccess(res, newBanner, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { reqData } = req.body;

    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, "Banner not found", 404);

    await banner.update({
      ...reqData,
      lastModifiedBy: req.user?.id || null,
    });

    return sendSuccess(res, banner);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// GET All Banners with Pagination
export const getAllBanners = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const banners = await Banner.findAll({ offset: skip, limit: top });
    return sendSuccess(res, banners);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// GET Total Banner Count
export const getTotalBannerCount = async (req, res) => {
  try {
    const count = await Banner.count();
    return sendSuccess(res, count); // send as number
  } catch (error) {
    return sendError(res, error.message);
  }
};


// GET Banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, "Banner not found", 404);

    return sendSuccess(res, banner);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// GET Banners by Type
export const getBannersByType = async (req, res) => {
  try {
    const { type } = req.params;

    const banners = await Banner.findAll({ where: { bannerType: type } });
    if (!banners || banners.length === 0)
      return sendError(res, "No banners found for this type", 404);

    return sendSuccess(res, banners);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// UPDATE Banner


// DELETE Banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return sendError(res, false, 404); // false if banner not found

    await banner.destroy();
    return sendSuccess(res, true); // true on successful delete
  } catch (error) {
    return sendError(res, false); // false on error
  }
};
