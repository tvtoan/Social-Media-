import Post from "../model/post.js";
import Comment from "../model/comment.js";
import User from "../model/user.js";

export const createPost = async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      mood: req.body.mood || "neutral",
      likes: req.body.likes || [],
    });

    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id).populate(
      "userId",
      "username profilePicture"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Lỗi tạo bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username profilePicture"
    );
    if (!post)
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    const comments = await Comment.find({ postId: req.params.id })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json({ ...post.toObject(), comments });
  } catch (error) {
    console.error("Lỗi lấy bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      "userId",
      "username profilePicture"
    );
    const postWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 });
        return { ...post.toObject(), comments };
      })
    );
    res.status(200).json(postWithComments);
  } catch (error) {
    console.error("Lỗi lấy danh sách bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).populate(
      "userId",
      "username profilePicture"
    );
    const postWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 });
        return { ...post.toObject(), comments };
      })
    );
    res.status(200).json(postWithComments);
  } catch (error) {
    console.error("Lỗi lấy bài viết theo user ID:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPostByMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("followings followers");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let filter = {};
    let sortOptions = { createdAt: -1 };

    const likedPosts = await Post.find({ likes: userId }).select("_id");

    console.log("Tâm trạng người dùng:", user.currentMood || "neutral");
    console.log("Followings:", user.followings || []);
    console.log(
      "Liked posts:",
      likedPosts.map((p) => p._id)
    );

    switch (user.currentMood || "neutral") {
      case "sad":
        filter = {
          $or: [
            { mood: "happy" },
            { mood: "excited" },
            { userId: { $in: user.followings || [] } },
            { _id: { $in: likedPosts.map((p) => p._id) || [] } },
          ],
        };
        break;

      case "happy":
        filter = {
          $or: [
            { mood: { $in: ["happy", "excited"] } },
            { userId: { $in: user.followings || [] } },
          ],
        };
        break;

      case "excited":
        filter = {
          $or: [
            { mood: "excited" },
            { userId: { $in: user.followings || [] } },
          ],
        };
        sortOptions = { likes: -1, createdAt: -1 };
        break;

      case "neutral":
      default:
        filter = {};
        sortOptions = { createdAt: -1 };
        break;
    }

    console.log("Filter bài viết:", filter);
    const totalPosts = await Post.countDocuments(filter);
    console.log(
      "Tổng số bài viết:",
      totalPosts,
      "Tổng số trang:",
      Math.ceil(totalPosts / limit)
    );

    const posts = await Post.find(filter)
      .populate("userId", "username profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const postWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 });
        return { ...post.toObject(), comments };
      })
    );

    const daysSinceLastHappy = user.lastLogin
      ? Math.floor(
          (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24)
        )
      : 0;
    if ((user.currentMood || "neutral") === "sad" && daysSinceLastHappy > 3) {
      const inspirationalPosts = await Post.find({ mood: "happy" })
        .sort({ likes: -1 })
        .limit(5);
      postWithComments.push(...inspirationalPosts.map((p) => p.toObject()));
    }

    res.status(200).json({
      posts: postWithComments,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
  } catch (error) {
    console.error("Lỗi lấy bài viết theo tâm trạng:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    if (post.userId.toString() === req.user.id) {
      await post.deleteOne();
      await Comment.deleteMany({ postId: req.params.id });
      res.status(200).json({ message: "Xóa bài viết thành công" });
    } else {
      res.status(403).json({ message: "Bạn chỉ có thể xóa bài viết của mình" });
    }
  } catch (error) {
    console.error("Lỗi xóa bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Thiếu postId trong yêu cầu" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "Bạn đã thích bài viết này rồi" });
    }

    post.likes.push(userId);
    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "userId",
      "username profilePicture"
    );

    res.status(200).json({
      message: "Thích bài viết thành công",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Lỗi thích bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};

export const unLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Thiếu postId trong yêu cầu" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: "Bạn chưa thích bài viết này" });
    }

    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "userId",
      "username profilePicture"
    );

    res.status(200).json({
      message: "Bỏ thích bài viết thành công",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Lỗi bỏ thích bài viết:", error);
    res.status(500).json({ message: error.message });
  }
};
