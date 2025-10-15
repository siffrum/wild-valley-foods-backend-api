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
  const fullFolder = folder.startsWith("uploads") ? folder : path.join("uploads", folder);
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
 * Convert standard images to WebP
 */
const convertToWebP = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".webp") return filePath; // already WebP

    const outputPath = filePath.replace(ext, ".webp");
    await sharp(filePath)
      .webp({ quality: 90 })
      .toFile(outputPath);

    fs.unlinkSync(filePath); // remove original
    console.log(`✅ Converted → WebP: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("❌ WebP conversion failed:", error);
    return filePath;
  }
};

/**
 * Multer uploaders
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
 * Middleware to convert uploaded images to WebP automatically
 */
export const convertUploadedImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const convertedPath = await convertToWebP(req.file.path);
    req.file.path = convertedPath;
    req.file.filename = path.basename(convertedPath);
    next();
  } catch (err) {
    console.error("❌ Error converting uploaded image:", err);
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

