import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";

/**
 * Configure multer storage (dynamic folder creation)
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "uploads/others";
    // ✅ Ensure folder always lives inside uploads/
    const fullFolder = folder.startsWith("uploads")
      ? folder
      : path.join("uploads", folder);
    const uploadDir = path.join(process.cwd(), fullFolder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

/**
 * Common file filter for all uploaders
 */
const fileFilter = (req, file, cb) => {
  const allowedExt = [
    ".jpg", ".jpeg", ".png", ".webp",
    ".gif", ".bmp", ".tiff", ".svg"
  ];
  const allowedMime = [
    "image/jpeg", "image/png", "image/webp",
    "image/gif", "image/bmp", "image/tiff",
    "image/svg+xml"
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!allowedExt.includes(ext) || !allowedMime.includes(mime)) {
    console.error(`❌ Blocked file: ${file.originalname} (${mime})`);
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
};

/**
 * Compress and convert uploaded image to WebP
 * Retains visual quality but reduces size dramatically
 */
const compressAndConvertImage = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const outputPath = filePath.replace(ext, ".webp");

    await sharp(filePath)
      .rotate() // auto-orient
      .resize({
        width: 1920, // ✅ maximum width to prevent large uploads
        withoutEnlargement: true,
      })
      .webp({
        quality: 85, // ✅ 80–90 = high quality with small size
        effort: 4,   // compression effort (1–6)
      })
      .toFile(outputPath);

    fs.unlinkSync(filePath); // remove original
    console.log(`✅ Compressed & converted → ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("❌ Image compression failed:", error);
    return filePath;
  }
};

/**
 * Multer uploaders (can define per module)
 */
export const uploadBanner = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 },
  fileFilter,
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 },
  fileFilter,
});

export const uploadCategory = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 },
  fileFilter,
});

/**
 * Middleware to compress uploaded image (for single file uploads)
 */
export const compressUploadedImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const compressedPath = await compressAndConvertImage(req.file.path);
    req.file.path = compressedPath;
    req.file.filename = path.basename(compressedPath);
    next();
  } catch (err) {
    console.error("❌ Error compressing uploaded image:", err);
    next();
  }
};

/**
 * Middleware to compress all uploaded images (for multiple file uploads)
 */
export const compressMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) return next();

    for (let file of req.files) {
      const compressedPath = await compressAndConvertImage(file.path);
      file.path = compressedPath;
      file.filename = path.basename(compressedPath);
    }
    next();
  } catch (err) {
    console.error("❌ Error compressing multiple images:", err);
    next();
  }
};

/**
 * Convert image file path to base64 string
 */
export const convertImageToBase64 = (filePath) => {
  try {
    if (!filePath) return null;
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (!fs.existsSync(absPath)) {
      console.error("❌ File not found:", absPath);
      return null;
    }

    const buffer = fs.readFileSync(absPath);
    let ext = path.extname(absPath).substring(1).toLowerCase();
    if (ext === "jpg") ext = "jpeg";

    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("❌ Error converting image to base64:", err);
    return null;
  }
};

/**
 * Delete file safely
 */
export const deleteFileSafe = (filePath) => {
  try {
    if (!filePath) return;
    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
      console.log(`🗑️ Deleted: ${absPath}`);
    }
  } catch (err) {
    console.error("❌ Error deleting file:", err);
  }
};
