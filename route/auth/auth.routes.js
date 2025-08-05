// import { Router } from "express";
// import {
//   registerController,
//   loginController,
//   refreshController,
//   logoutController,
//   profileController,
// } from "../../controller/auth/userController.js";
// import { authenticateToken } from "../../middlewares/auth/auth.js";

// const router = Router();
// router.post("/register", registerController);
// router.post("/login", loginController);
// router.post("/refreshtoken", refreshController);
// router.post("/logout", logoutController);
// router.post("/profile", authenticateToken, profileController);

// export default router;

import express from 'express';
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  checkEmailExistsController
} from '../../controller/auth/userController.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password/:token', resetPasswordController);
router.post('/check-email', checkEmailExistsController); // ✅ New

export default router;

