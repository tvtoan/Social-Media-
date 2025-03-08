import express from "express";
import {
  register,
  login,
  verifyToken,
  getCurrentUser,
  getUserByUsername,
  getAllUsers,
  getUserById,
  uploadSingle,
  updateProfilePicture,
  updateCoverPicture,
} from "../controllers/authController";
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.get("/current", verifyToken, getCurrentUser);
router.get("/user", getUserByUsername);
router.get("/:id", getUserById);

router.put("/profile-picture", verifyToken, uploadSingle, updateProfilePicture);
router.put("/cover-picture", verifyToken, uploadSingle, updateCoverPicture);

export default router;
