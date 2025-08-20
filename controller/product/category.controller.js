import { categories as Category } from '../../db/dbconnection.js';
import { sendSuccess, sendError } from '../../Helper/response.helper.js';

// Admin Only: Create Category
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);

    let reqData = req.body.reqData;
    reqData.createdBy = req.user.id;

    const category = await Category.create(reqData);
    return sendSuccess(res, category, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Admin Only: Update Category
export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);

    let reqData = req.body.reqData;
    reqData.lastModifiedBy = req.user.id;

    const updated = await Category.update(reqData, {
      where: { id: req.params.id },
      returning: true,
    });

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

// ✅ [GET ALL CATEGORIES]
// Public: Get All Categories with Pagination
// ✅ Get All Categories (Paginated, without subcategories)
export const getAllCategoriesPaginated = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;

    const categories = await Category.findAll({
      order: [['sequence', 'ASC']],
      offset: skip,
      limit: top,
    });

    return sendSuccess(res, categories);
  } catch (err) {
    return sendError(res, err.message);
  }
}


// Public: Get All Categories with Subcategories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null },
      include: [
        {
          model: Category,
          as: 'subcategories',
          required: false,
        },
      ],
      order: [['sequence', 'ASC']],
    });
    return sendSuccess(res, categories);
  } catch (err) {
    return sendError(res, err.message);
  }
};
// Public: Get Total Category Count
export const getCategoryCount = async (req, res) => {
  try {
    const total = await Category.count();

    const response = {
      intResponse: total,
      responseMessage: "Total category count fetched successfully",
    };

    return sendSuccess(res, response);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Public: Get Category By ID with Subcategories
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return sendError(res, 'Category not found', 404);
    return sendSuccess(res, category);
  } catch (err) {
    return sendError(res, err.message);
  }
};
