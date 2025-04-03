import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, max: 500 },
    image: { type: String },
    mood: {
      type: String,
      enum: ["happy", "sad", "excited", "neutral"],
      default: "neutral",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
