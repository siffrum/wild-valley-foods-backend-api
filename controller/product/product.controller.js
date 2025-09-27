import { Product, Image, categories as Category } from "../../db/dbconnection.js";
import { sendSuccess, sendError } from "../../Helper/response.helper.js";
import { convertImageToBase64, deleteFileSafe } from "../../Helper/multer.helper.js";
import { Op } from "sequelize";
import razorpay from "../../route/customer/razorpay.js";
// ✅ SEARCH PRODUCTS WITH ODATA

export const searchProductsOdata = async (req, res) => {
  try {
    const keyword = req.query.q ? req.query.q.trim() : "";

    // Require at least 3 characters
    if (!keyword || keyword.length < 3) {
      return sendError(res, "Please enter at least 3 characters", 400);
    }

    const skip = parseInt(req.query.$skip, 10) || 0;
    const top = parseInt(req.query.$top, 10) || 10;

    // 🔍 Search condition across product name & category
    const whereCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${keyword}%` } },               // product name
        { description: { [Op.iLike]: `%${keyword}%` } },        // product description if exists
      ]
    };

    const { count: total, rows: items } = await Product.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: "category",
          where: { name: { [Op.iLike]: `%${keyword}%` } }, // match category too
          required: false
        },
        { model: Image, as: "images" }
      ],
      offset: skip,
      limit: top,
    });
    
 if (!items.length) {
      return sendError(res, "No products found for this keyword", 404);
    }
    // ✅ Convert images
    const result = items.map(prod => {
      const obj = prod.toJSON();
      obj.images = obj.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ SEARCH PRODUCTS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET PRODUCTS BY CATEGORY ID
// ✅ GET PRODUCTS BY CATEGORY ID (with pagination)
export const getProductsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return sendError(res, "Category ID is required", 400);
    }

    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Product.findAndCountAll({
      where: { categoryId },
      offset: skip,
      limit: top,
      include: [
        { model: Category, as: "category" },
        { model: Image, as: "images" },
      ],
    });

    if (!items.length) {
      return sendError(res, "No products found for this category", 404);
    }

    const result = items.map((prod) => {
      const obj = prod.toJSON();
      obj.images = obj.images
        .map((img) => convertImageToBase64(img.imagePath))
        .filter(Boolean);
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET PRODUCTS BY CATEGORY ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET PRODUCT COUNT BY CATEGORY ID
export const getProductCountByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return sendError(res, "Category ID is required", 400);
    }

    const count = await Product.count({
      where: { categoryId },
    });

    return sendSuccess(res, { categoryId, total: count });
  } catch (err) {
    console.error("❌ GET PRODUCT COUNT BY CATEGORY ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ GET NEW ARRIVAL PRODUCTS (Last 10 Added)
export const getNewArrivalProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdOnUTC", "DESC"]], // newest first
      limit: 8,
      include: [
        { model: Category, as: "category" },
        { model: Image, as: "images" },
      ],
    });

    const result = products.map((prod) => {
      const obj = prod.toJSON();
      obj.images = obj.images
        .map((img) => convertImageToBase64(img.imagePath))
        .filter(Boolean);
      return obj;
    });

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ GET NEW ARRIVALS ERROR:", err);
    return sendError(res, err.message);
  }
};

// ✅ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.createdBy = req.user.id;
    reqData.lastModifiedBy = req.user.id;

    // Step 1: Create product in Razorpay
    const razorpayItem = await razorpay.items.create({
      name: reqData.name,
      description: reqData.description,
      amount: Math.round(parseFloat(reqData.price) * 100), // paise
      currency: reqData.currency || "INR",
      hsn_code: reqData.hsnCode,
      tax_rate: reqData.taxRate,
      unit: reqData.unit,
    });

    // Step 2: Save in DB
    const product = await Product.create({
      ...reqData,
      razorpayItemId: razorpayItem.id,
    });

    // Step 3: Save Images
    if (req.files && req.files.length) {
      for (const file of req.files) {
        await Image.create({ imagePath: file.path, productId: product.id });
      }
    }

    const productWithImages = await Product.findByPk(product.id, {
      include: [{ model: Image, as: "images" }],
    });

    const result = productWithImages.toJSON();
    result.images = result.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);

    return sendSuccess(res, { ...result, razorpay: razorpayItem }, 201);
  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const reqData = req.body.reqData ? JSON.parse(req.body.reqData) : {};
    reqData.lastModifiedBy = req.user.id;

    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, "Product not found", 404);

    // Step 1: Update Razorpay
    if (product.razorpayItemId) {
      await razorpay.items.edit(product.razorpayItemId, {
        name: reqData.name || product.name,
        description: reqData.description || product.description,
        amount: reqData.price ? Math.round(parseFloat(reqData.price) * 100) : undefined,
        currency: reqData.currency || product.currency,
        hsn_code: reqData.hsnCode || product.hsnCode,
        tax_rate: reqData.taxRate || product.taxRate,
        unit: reqData.unit || product.unit,
      });
    }

    // Step 2: Update DB
    await product.update(reqData);

    // Step 3: Replace Images if provided
    if (req.files && req.files.length) {
      const existing = await Image.findAll({ where: { productId: req.params.id } });
      for (const img of existing) deleteFileSafe(img.imagePath);
      await Image.destroy({ where: { productId: req.params.id } });

      for (const file of req.files) {
        await Image.create({ imagePath: file.path, productId: product.id });
      }
    }

    const updated = await Product.findByPk(req.params.id, {
      include: [{ model: Image, as: "images" }],
    });

    const result = updated.toJSON();
    result.images = result.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);

    return sendSuccess(res, result);
  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err);
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

    // return sendSuccess(res, { items: productsWithBase64, total, skip, top });
    return sendSuccess(res, productsWithBase64);
  } catch (err) {
    console.error("❌ ODATA PRODUCTS ERROR:", err);
    return sendError(res, err.message);
  }
};
// ✅ UPDATE PRODUCT

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



// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "Admin") return sendError(res, "Unauthorized", 403);

    const product = await Product.findByPk(req.params.id);
    if (!product) return sendError(res, "Product not found", 404);

    // Step 1: Delete in Razorpay
    if (product.razorpayItemId) {
      await razorpay.items.delete(product.razorpayItemId);
    }

    // Step 2: Delete images & DB record
    const images = await Image.findAll({ where: { productId: product.id } });
    for (const img of images) deleteFileSafe(img.imagePath);
    await Image.destroy({ where: { productId: product.id } });
    await product.destroy();

    return sendSuccess(res, null);
  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err);
    return sendError(res, err.message);
  }
};
