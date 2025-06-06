import express from "express";
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:postId", authMiddleware, createComment);
router.get("/:postId", authMiddleware, getCommentsByPostId);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;
