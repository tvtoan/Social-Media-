import mongoose from "mongoose";

// Connect to MongoDB with retry logic
export const connectDb = async (uri) => {
  const maxRetries = 5;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(uri);
      console.log("✅ MongoDB kết nối thành công");
      return;
    } catch (error) {
      console.error(
        `❌ Kết nối MongoDB thất bại (lần thử ${attempt}):`,
        error.message
      );
      if (attempt === maxRetries) {
        console.error("❌ Đã đạt số lần thử tối đa. Thoát...");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Chờ 5 giây trước khi thử lại
      attempt++;
    }
  }
};
