import express from "express";
import authRouter from "./routers/auth.js";
import inboxRouter from "./routers/inbox.js";
import postRouter from "./routers/post.js";
import storyRouter from "./routers/story.js";
import videoRouter from "./routers/video.js";
import commentRouter from "./routers/comment.js";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

// Config for dotenv
dotenv.config();

const app = express();

// Config CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Create static directories if they don't exist
const uploadDirs = [
  "uploads",
  "uploadStories",
  "uploadVideos",
  "uploadPictures",
];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Serve static files
app.use("/uploads", express.static("uploads"));
app.use("/uploadStories", express.static("uploadStories"));
app.use("/uploadVideos", express.static("uploadVideos"));
app.use("/uploadPictures", express.static("uploadPictures"));

// Connect to MongoDB
const dbURI = process.env.MONGODB_URI;
if (dbURI) {
  connectDb(dbURI).catch((err) =>
    console.error("❌ Lỗi kết nối cơ sở dữ liệu:", err.message)
  );
} else {
  console.error("❌ MONGODB_URI chưa được định nghĩa trong biến môi trường");
}

// Routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/stories", storyRouter);
app.use("/api/videos", videoRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/comments", commentRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Đã xảy ra lỗi!" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend server đang chạy trên http://localhost:${port}`);
});

export const viteNodeApp = app;
