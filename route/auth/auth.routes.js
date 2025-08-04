import { Router } from "express";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  profileController,
} from "../../controller/auth/userController.js";
import { authenticateToken } from "../../middlewares/auth/auth.js";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refreshtoken", refreshController);
router.post("/logout", logoutController);
router.post("/profile", authenticateToken, profileController);

export default router;
