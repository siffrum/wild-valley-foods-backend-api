// import { categories as Category } from "../../db/dbconnection.js";
import { Product, Image, categories as Category } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import { convertImageToBase64, deleteFileSafe } from "../../Helper/multer.helper.js";
// import Image from "../../model/image.model.js";
// ✅ CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.createdBy = req.user.id;
    reqData.lastModifiedBy=req.user.id;

    const category = await Category.create(reqData);

    if (req.file) {
      category.category_icon = req.file.path;
      await category.save();
    }

    const result = category.toJSON();
    result.category_icon_base64 = result.category_icon ? convertImageToBase64(result.category_icon) : null;
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error("❌ CREATE CATEGORY ERROR:", err);
    return sendError(res, err.message);
  }
};
// ✅ UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.lastModifiedBy = req.user.id;

    const category = await Category.findByPk(req.params.id);
    if (!category) return sendError(res, "Category not found", 404);

    // Update category details first
    await category.update(reqData);

    // If new icon uploaded → delete old and save new
    if (req.file) {
      if (category.category_icon) {
        deleteFileSafe(category.category_icon);
      }
      category.category_icon = req.file.path;
      await category.save();
    }

    // Prepare final response
    const result = category.toJSON();
    result.category_icon_base64 = category.category_icon
      ? convertImageToBase64(category.category_icon)
      : null;

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ UPDATE CATEGORY ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CATEGORIES PAGINATED
export const getAllCategoriesPaginated = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const top = parseInt(req.query.top) || 10;
    const categories = await Category.findAll({ order: [["sequence", "ASC"]], offset: skip, limit: top });

    const result = categories.map(cat => {
      const obj = cat.toJSON();
      obj.category_icon_base64 = obj.category_icon ? convertImageToBase64(obj.category_icon) : null;
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ PAGINATED FETCH ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null },
      include: [{ model: Category, as: "subcategories", required: false }],
      order: [["sequence", "ASC"]],
    });

    const result = categories.map(cat => {
      const obj = cat.toJSON();
      obj.category_icon_base64 = obj.category_icon ? convertImageToBase64(obj.category_icon) : null;
      if (obj.subcategories?.length) {
        obj.subcategories = obj.subcategories.map(sub => {
          sub.category_icon_base64 = sub.category_icon ? convertImageToBase64(sub.category_icon) : null;
          return sub;
        });
      }
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET ALL CATEGORIES ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return sendError(res, "Category not found", 404);

    const result = category.toJSON();
    result.category_icon_base64 = result.category_icon ? convertImageToBase64(result.category_icon) : null;
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET CATEGORY BY ID ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET CATEGORY COUNT
export const getCategoryCount = async (req, res) => {
  try {
    const total = await Category.count();
    return sendSuccess(res, { intResponse: total, responseMessage: "Total category count fetched successfully" });
  } catch (err) {
    console.error("❌ GET CATEGORY COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};



// ✅ DELETE CATEGORY
// export const deleteCategory = async (req, res) => {
//   try {
//     if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return sendError(res, "Category not found", 404);

//     deleteFileSafe(category.category_icon);
//     await Category.destroy({ where: { id: req.params.id } });
//     return sendSuccess(res, null);
//   } catch (err) {
//     console.error("❌ DELETE CATEGORY ERROR:", err);
//     return sendError(res, err.message);
//   }
// };

// ✅ DELETE CATEGORY (auto delete products too)
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const category = await Category.findByPk(req.params.id, { include: "products" });
    if (!category) return sendError(res, "Category not found", 404);

    // 🔹 Delete products and their images first
    for (const product of category.products) {
      const images = await Image.findAll({ where: { productId: product.id } });
      for (const img of images) deleteFileSafe(img.imagePath);

      await Image.destroy({ where: { productId: product.id } });
      await Product.destroy({ where: { id: product.id } });
    }

    // 🔹 Delete category icon
    deleteFileSafe(category.category_icon);

    // 🔹 Delete the category itself
    await Category.destroy({ where: { id: req.params.id } });

    return  sendSuccess(res, {
      boolResponse: true,
      responseMessage: `Category "${category.name}" and its products were deleted successfully.`
    });;
  } catch (err) {
    console.error("❌ DELETE CATEGORY ERROR:", err);
    return sendError(res, err.message);
  }
};


