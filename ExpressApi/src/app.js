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

// config for dotenv
dotenv.config();

const app = express();

// config cors (dùng FRONTEND_URL từ môi trường)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Linh hoạt cho cục bộ và deploy
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Xử lý đường dẫn tĩnh, đảm bảo tồn tại hoặc bỏ qua khi không có
app.use("/uploads", express.static("uploads"));
app.use("/uploadStories", express.static("uploadStories"));
app.use("/uploadVideos", express.static("uploadVideos"));
app.use("/uploadPictures", express.static("uploadPictures"));

// connect Db
const dbURI = process.env.MONGODB_URI;
console.log("Database URI:", dbURI);
if (dbURI) {
  connectDb(dbURI).catch((err) =>
    console.log("Database connection error:", err)
  );
} else {
  console.log("MONGODB_URI is not defined in environment variables");
}

// router
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/stories", storyRouter);
app.use("/api/videos", videoRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/comments", commentRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

export const viteNodeApp = app;
