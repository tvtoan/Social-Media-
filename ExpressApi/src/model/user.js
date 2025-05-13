import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === "local";
        },
        "Mật khẩu là bắt buộc cho đăng nhập cục bộ",
      ],
    },
    address: { type: String, default: "" },
    currentMood: {
      type: String,
      enum: ["happy", "sad", "excited", "neutral"],
      default: "neutral",
    },
    profilePicture: { type: String, default: "" },
    coverPicture: { type: String, default: "" },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    points: { type: Number, default: 0 },
    introduce: { type: String, max: 200, default: "" },
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },
    googleId: { type: String },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
