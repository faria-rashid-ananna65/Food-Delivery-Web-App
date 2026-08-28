import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

export default router;
