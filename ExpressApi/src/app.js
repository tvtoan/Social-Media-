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

// config cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/uploadStories", express.static("uploadStories"));
app.use("/uploadVideos", express.static("uploadVideos"));
app.use("/uploadPictures", express.static("uploadPictures"));

// connect Db
console.log("Database URI:", process.env.DB_URI);
connectDb(process.env.DB_URI);

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
