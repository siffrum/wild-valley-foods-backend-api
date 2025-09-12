import express from "express";
import {
  createContactUs,
  getAllContactUs,
  getAllContactUsPaginated,
  getContactUsById,
  getContactUsCount,
  updateContactUs,
  deleteContactUs,
} from "../../controller/contact-us/contact-us-controller.js";
import authenticate from "../../middlewares/auth/auth.js";

const router = express.Router();

// Public
router.post("/", createContactUs); // Anyone can submit ContactUs form

// Admin
router.get("/all",authenticate, getAllContactUs); // Admin: Get all without pagination
router.get("/count",authenticate, getContactUsCount);
router.get("/paginated",authenticate, getAllContactUsPaginated);
router.get("/:id",authenticate, getContactUsById);
router.put("/:id",authenticate, updateContactUs);
router.delete("/:id",authenticate, deleteContactUs);

export default router;
