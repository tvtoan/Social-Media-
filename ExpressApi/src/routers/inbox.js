import { createMessage, getMessages } from "../controllers/inboxController.js";
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createMessage);
router.get("/:receiverId", authMiddleware, getMessages);

export default router;
