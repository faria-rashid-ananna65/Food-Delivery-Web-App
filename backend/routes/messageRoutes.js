import express from "express";
import {
  createMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createMessage);
router.get("/", protect, adminOnly, getMessages);
router.delete("/:id", protect, adminOnly, deleteMessage);

export default router;
