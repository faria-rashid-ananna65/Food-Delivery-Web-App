import express from "express";
import {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../controllers/menuController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getMenus);
router.get("/:id", getMenuById);
router.post("/", protect, adminOnly, upload.single("image"), createMenu);
router.put("/:id", protect, adminOnly, upload.single("image"), updateMenu);
router.delete("/:id", protect, adminOnly, deleteMenu);

export default router;
