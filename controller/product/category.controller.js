import { categories as Category } from '../../db/dbconnection.js'; 
import { sendSuccess, sendError } from '../../Helper/response.helper.js';

// Admin Only: Create Category
export const createCategory = async (req, res) => {
  const { reqData } = req.body;
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);
    reqData.createdBy = req.user.id;
    const category = await Category.create(reqData);
    return sendSuccess(res, category, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Admin Only: Update Category
export const updateCategory = async (req, res) => {
  const { reqData } = req.body;
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);
    reqData.lastModifiedBy = req.user.id;
    const updated = await Category.update(reqData, { where: { id: req.params.id }, returning: true });
    return sendSuccess(res, updated[1][0]);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Admin Only: Delete Category
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);
    await Category.destroy({ where: { id: req.params.id } });
    return sendSuccess(res, null);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Public: Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return sendSuccess(res, categories);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Public: Get Category By ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, category);
  } catch (err) {
    return sendError(res, err.message);
  }
};