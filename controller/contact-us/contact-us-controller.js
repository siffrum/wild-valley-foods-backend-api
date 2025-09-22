import { ContactUs } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";

// ✅ CREATE CONTACT US
export const createContactUs = async (req, res) => {
  try {
    const reqData = req.body.reqData || {}; // ✅ no JSON.parse
    const contact = await ContactUs.create(reqData);
    const result = contact.toJSON();

    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error("❌ CREATE CONTACTUS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CONTACTUS (Paginated)
export const getAllContactUsPaginated = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const contactus = await ContactUs.findAll({
      offset: skip,
      limit: top,
      order: [["createdOnUTC", "DESC"]],
    });

    const result = contactus.map((c) => c.toJSON());
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET ALL CONTACTUS PAGINATED ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CONTACTUS (Admin only, no pagination)
export const getAllContactUs = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const contactus = await ContactUs.findAll({ order: [["createdOnUTC", "DESC"]] });
    const result = contactus.map((c) => c.toJSON());
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET ALL CONTACTUS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET CONTACTUS BY ID
export const getContactUsById = async (req, res) => {
  try {
    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) return sendError(res, "ContactUs entry not found", 404);

    return sendSuccess(res, contact.toJSON());
  } catch (err) {
    console.error("❌ GET CONTACTUS BY ID ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET CONTACTUS COUNT
export const getContactUsCount = async (req, res) => {
  try {
    const total = await ContactUs.count();
    return sendSuccess(res, {
      intResponse: total,
      responseMessage: "Total ContactUs entries fetched successfully",
    });
  } catch (err) {
    console.error("❌ GET CONTACTUS COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ UPDATE CONTACTUS
// ✅ UPDATE CONTACTUS
export const updateContactUs = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    // if req.body.reqData is already an object, don’t parse
     const reqData = req.body.reqData || {}; // ✅ no JSON.parse
      // ? JSON.parse(req.body.reqData)
      // : req.body.reqData;

    reqData.lastModifiedBy = req.user.id;

    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) return sendError(res, "ContactUs entry not found", 404);

    await contact.update(reqData);

    return sendSuccess(res, contact.toJSON());
  } catch (err) {
    console.error("❌ UPDATE CONTACTUS ERROR:", err);
    return sendError(res, err.message);
  }
};


// ✅ DELETE CONTACTUS
export const deleteContactUs = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const contact = await ContactUs.findByPk(req.params.id);
    if (!contact) return sendError(res, "ContactUs entry not found", 404);

    await ContactUs.destroy({ where: { id: req.params.id } });
    return sendSuccess(res, null);
  } catch (err) {
    console.error("❌ DELETE CONTACTUS ERROR:", err);
    return sendError(res, err.message);
  }
};
