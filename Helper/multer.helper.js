import fs from "fs";
import path from "path";
import multer from "multer";

/**
 * Configure multer for all image types up to 50MB
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = req.uploadFolder || "uploads/others";
    const uploadDir = path.join("uploads", folder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".jpg", ".jpeg", ".png", ".webp",
      ".gif", ".bmp", ".tiff", ".svg"
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
  },
});

/**
 * Convert image file path to base64 string
 */
export const convertImageToBase64 = (filePath) => {
  try {
    if (!filePath) return null;

    // Ensure absolute path regardless of input
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
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted: ${filePath}`);
    }
  } catch (err) {
    console.error("❌ Error deleting file:", err);
  }
};
