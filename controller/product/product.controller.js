import { Product, Image, categories as Category } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import { convertImageToBase64, deleteFileSafe } from "../../Helper/multer.helper.js";

// ✅ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.createdBy = req.user.id;

    const product = await Product.create(reqData);

    if (req.files && req.files.length) {
      for (const file of req.files) {
        await Image.create({ imagePath: file.path, productId: product.id });
      }
    }

    const productWithImages = await Product.findByPk(product.id, { include: [{ model: Image, as: "images" }] });
    const result = productWithImages.toJSON();
    result.images = result.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
    return sendSuccess(res, result, 201);
  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ include: [{ model: Category, as: "category" }, { model: Image, as: "images" }] });
    const result = products.map(prod => {
      const obj = prod.toJSON();
      obj.images = obj.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return obj;
    });
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET ALL PRODUCTS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET PRODUCTS WITH PAGINATION
export const getAllProductsByOdata = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;
    const { count: total, rows: items } = await Product.findAndCountAll({
      offset: skip,
      limit: top,
      include: [{ model: Category, as: "category" }, { model: Image, as: "images" }],
    });

    const productsWithBase64 = items.map(prod => {
      const obj = prod.toJSON();
      obj.images = obj.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return obj;
    });

    return sendSuccess(res, { items: productsWithBase64, total, skip, top });
  } catch (err) {
    console.error("❌ ODATA PRODUCTS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET PRODUCT COUNT
export const getProductCount = async (req, res) => {
  try {
    const total = await Product.count();
    return sendSuccess(res, { intResponse: total, responseMessage: "Total product count fetched successfully" });
  } catch (err) {
    console.error("❌ PRODUCT COUNT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: [{ model: Category, as: "category" }, { model: Image, as: "images" }] });
    if (!product) return sendError(res, "Product not found", 404);

    const result = product.toJSON();
    result.images = result.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.lastModifiedBy = req.user.id;

    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, "Product not found", 404);

    await product.update(reqData);

    if (req.files && req.files.length) {
      const existing = await Image.findAll({ where: { productId: req.params.id } });
      for (const img of existing) deleteFileSafe(img.imagePath);
      await Image.destroy({ where: { productId: req.params.id } });

      for (const file of req.files) {
        await Image.create({ imagePath: file.path, productId: product.id });
      }
    }

    const updated = await Product.findByPk(req.params.id, { include: [{ model: Image, as: "images" }] });
    const result = updated.toJSON();
    result.images = result.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);
    const images = await Image.findAll({ where: { productId: req.params.id } });
    for (const img of images) deleteFileSafe(img.imagePath);
    await Image.destroy({ where: { productId: req.params.id } });
    await Product.destroy({ where: { id: req.params.id } });
    return sendSuccess(res, null);
  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};
