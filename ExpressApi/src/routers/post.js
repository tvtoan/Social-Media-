import express from "express";
import {
  createPost,
  getPost,
  getPosts,
  deletePost,
  getPostsByUserId,
  getPostByMood,
  likePost,
  unLikePost,
} from "../controllers/postController";
import authMiddleware from "../middlewares/authMiddleware";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("image"), createPost);

router.get("/", authMiddleware, getPosts);
router.get("/:id", authMiddleware, getPost);
router.get("/user/:userId", authMiddleware, getPostsByUserId);
router.get("/mood/:mood", authMiddleware, getPostByMood);
router.delete("/:id", authMiddleware, deletePost);
router.post("/like/:postId", authMiddleware, likePost);
router.post("/unlike/:postId", authMiddleware, unLikePost);

export default router;
