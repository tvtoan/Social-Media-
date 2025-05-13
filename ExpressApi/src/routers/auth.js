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
  followUser,
  unfollowUser,
  updateIntroduce,
  updateAddress,
  googleAuth,
  googleCallback,
  logout,
} from "../controllers/authController";
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/users", getAllUsers);
router.get("/current", verifyToken, getCurrentUser);
router.get("/user", getUserByUsername);
router.get("/:id", getUserById);

router.put("/profile-picture", verifyToken, uploadSingle, updateProfilePicture);
router.put("/cover-picture", verifyToken, uploadSingle, updateCoverPicture);
router.post("/follow/:id", verifyToken, followUser);
router.delete("/unfollow/:id", verifyToken, unfollowUser);
router.put("/introduce", verifyToken, updateIntroduce);
router.put("/address", verifyToken, updateAddress);

export default router;
