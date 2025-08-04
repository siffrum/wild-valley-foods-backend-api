import { License } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from '../../Helper/response.helper.js';
// const License = db.License;

// CREATE License
export const createLicense = async (req, res) => {
  try {
    const { reqData } = req.body;
 const newLicense = await License.create({
  ...reqData,
  createdBy: req.user?.id || null,
  lastModifiedBy: req.user?.id || null,
});
    return sendSuccess(res, newLicense, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};


// GET All Licenses
export const getAllLicenses = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const licenses = await License.findAll({ offset: skip, limit: top });
    return sendSuccess(res, licenses);
  } catch (error) {
    return sendError(res, error.message);
  }
};


// GET License by ID
export const getLicenseById = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return sendError(res, "License not found", 404);
    return sendSuccess(res, license);
  } catch (error) {
    return sendError(res, error.message);
  }
};


// UPDATE License
export const updateLicense = async (req, res) => {
  try {
    const { reqData } = req.body;
    const license = await License.findByPk(req.params.id);
    if (!license) return sendError(res, "License not found", 404);

    await license.update({
  ...reqData,
  lastModifiedBy: req.user?.id || null,
});
    return sendSuccess(res, license);
  } catch (error) {
    return sendError(res, error.message);
  }
};


// DELETE License
export const deleteLicense = async (req, res) => {
  try {
    const license = await License.findByPk(req.params.id);
    if (!license) return sendError(res, "License not found", 404);

    await license.destroy();
    return sendSuccess(res, { message: "License deleted" });
  } catch (error) {
    return sendError(res, error.message);
  }
};

