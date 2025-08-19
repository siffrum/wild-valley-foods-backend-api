// ✅ IMPORTS
import { Product, Image, categories as Category } from '../../db/dbconnection.js';
import { sendSuccess, sendError } from '../../Helper/response.helper.js';
import fs from 'fs';
import path from 'path';

// ✅ HELPER: Convert image path to base64
const convertImageToBase64 = (filePath) => {
  try {
    const image = fs.readFileSync(filePath);
    const ext = path.extname(filePath).substring(1);
    return `data:image/${ext};base64,${image.toString('base64')}`;
  } catch {
    return null;
  }
};

// ✅ [CREATE PRODUCT] with images from base64
export const createProduct = async (req, res) => {
  const { reqData, images } = req.body;
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);

    reqData.createdBy = req.user.id;
    const product = await Product.create(reqData);

    const uploadDir = path.join('uploads', 'images');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    if (images && images.length > 0) {
      for (const base64Img of images) {
        const matches = base64Img.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) continue;

        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `product_${product.id}_${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);

        await Image.create({
          imagePath: filePath,
          productId: product.id,
        });
      }
    }

    return sendSuccess(res, product, 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ [UPDATE PRODUCT]
export const updateProduct = async (req, res) => {
  const { reqData } = req.body;
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);

    reqData.lastModifiedBy = req.user.id;
    const updated = await Product.update(reqData, {
      where: { id: req.params.id },
      returning: true,
    });

    return sendSuccess(res, updated[1][0]);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ [DELETE PRODUCT]
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return sendError(res, 'Unauthorized', 403);

    // Optionally delete images from disk here
    const images = await Image.findAll({ where: { productId: req.params.id } });
    for (const img of images) {
      if (fs.existsSync(img.imagePath)) fs.unlinkSync(img.imagePath);
    }

    await Image.destroy({ where: { productId: req.params.id } });
    await Product.destroy({ where: { id: req.params.id } });

    return sendSuccess(res, null);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ [GET ALL PRODUCTS]
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Image, as: 'images' },
      ],
    });

    const result = products.map(product => {
      const prod = product.toJSON();
      prod.images = prod.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return prod;
    });

    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Public: Get Total Product Count
export const getProductCount = async (req, res) => {
  try {
    const total = await Product.count();

    const response = {
      intResponse: total,
      responseMessage: "Total product count fetched successfully",
    };

    return sendSuccess(res, response);
  } catch (err) {
    return sendError(res, err.message);
  }
};


// ✅ [GET ALL PRODUCTS BY ODATA with pagination]
export const getAllProductsByOdata = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const top = parseInt(req.query.top, 10) || 10;

    const { count: total, rows: items } = await Product.findAndCountAll({
      offset: skip,
      limit: top,
      include: [
        { model: Category, as: 'category' },
        { model: Image, as: 'images' },
      ],
    });

    const productsWithBase64 = items.map(product => {
      const prod = product.toJSON();
      prod.images = prod.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return prod;
    });

    return sendSuccess(res, { items: productsWithBase64, total, skip, top });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ [GET PRODUCT BY ID]
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Image, as: 'images' },
      ],
    });
    if (!product) return sendError(res, 'Product not found', 404);

    const prod = product.toJSON();
    prod.images = prod.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);

    return sendSuccess(res, prod);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// ✅ [GET PRODUCTS BY CATEGORY ID]
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.findAll({
      where: { categoryId },
      include: [
        { model: Category, as: 'category' },
        { model: Image, as: 'images' },
      ],
    });

    const result = products.map(product => {
      const prod = product.toJSON();
      prod.images = prod.images.map(img => convertImageToBase64(img.imagePath)).filter(Boolean);
      return prod;
    });

    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err.message);
  }
};
