import { Video } from "../../db/dbconnection.js";
import { sendError, sendSuccess } from "../../Helper/response.helper.js";

// ✅ Create Video (Admin Only)
export const createVideo = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? req.body.reqData : {};
    if (!reqData.title?.trim()) return sendError(res, "Title is required", 400);
    if (!reqData.youtubeUrl?.trim()) return sendError(res, "Video URL is required", 400);

    reqData.createdBy = req.user.id;
    reqData.lastModifiedBy = req.user.id;

    const video = await Video.create(reqData);

    return sendSuccess(
      res,
      {
        ...video.toJSON(),
        responseMessage: "Video created successfully",
      },
      201
    );
  } catch (err) {
    console.error("❌ CREATE VIDEO ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Update Video (Admin Only)
export const updateVideo = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? req.body.reqData : {};
    const video = await Video.findByPk(req.params.id);
    if (!video) return sendError(res, "Video not found", 404);

    reqData.lastModifiedBy = req.user.id;
    await video.update(reqData);

    return sendSuccess(res, {
      ...video.toJSON(),
      responseMessage: "Video updated successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE VIDEO ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get All Videos (Paginated)
export const getPaginatedVideos = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Video.findAndCountAll({
      offset: skip,
      limit: top,
      order: [["createdOnUTC", "DESC"]],
    });

    return sendSuccess(res, {
      items,
      intResponse: total,
      responseMessage: "Videos fetched successfully",
      skip,
      top,
    });
  } catch (err) {
    console.error("❌ GET PAGINATED VIDEOS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get All Videos (No Pagination)
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      order: [["createdOnUTC", "DESC"]],
    });
    return sendSuccess(res, {
      items: videos,
      intResponse: videos.length,
      responseMessage: "All videos fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET ALL VIDEOS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Video By ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return sendError(res, "Video not found", 404);

    return sendSuccess(res, {
      ...video.toJSON(),
      responseMessage: "Video fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET VIDEO ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Get Video Count
export const getVideoCount = async (req, res) => {
  try {
    const total = await Video.count();
    return sendSuccess(res, {
      intResponse: total,
      responseMessage: "Total video count fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET VIDEO COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ Delete Video (Admin Only)
export const deleteVideo = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const video = await Video.findByPk(req.params.id);
    if (!video) return sendError(res, "Video not found", 404);

    await video.destroy();

    return sendSuccess(res, {
      boolResponse: true,
      responseMessage: "Video deleted successfully",
    });
  } catch (err) {
    console.error("❌ DELETE VIDEO ERROR:", err);
    return sendError(res, err.message);
  }
};
