import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, deleteAvatar);

export default router;
