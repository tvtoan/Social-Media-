import Post from "../model/post.js";
import Comment from "../model/comment.js";
import User from "../model/user.js";

export const createPost = async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      likes: req.body.likes || [],
    });

    const savedPost = await newPost.save();

    // + 10 points cho user
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username profilePicture"
    );
    const comments = await Comment.find({ postId: req.params.id })
      .populate("userId", "username profilePicture")
      .sort({ createAt: -1 });
    res.status(200).json({ ...post.toObject(), comments });
  } catch (error) {
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
          .sort({ createAt: -1 });
        return { ...post.toObject(), comments };
      })
    );
    res.status(200).json(postWithComments);
  } catch (error) {
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
          .sort({ createAt: -1 });
        return { ...post.toObject(), comments };
      })
    );
    res.status(200).json(postWithComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostByMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("followings followers");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    let filter = {};
    let sortOptions = { createdAt: -1 }; // Mặc định sắp xếp theo thời gian

    // Lấy danh sách bài viết người dùng đã thích
    const likedPosts = await Post.find({ likes: userId }).select("_id");

    // Logic recommend dựa trên currentMood
    switch (user.currentMood) {
      case "sad":
        // Ưu tiên bài happy từ người follow hoặc từng tương tác
        filter = {
          $or: [
            { mood: "happy" },
            { mood: "excited" },
            { userId: { $in: user.followings } }, // Bài từ người đang follow
            { _id: { $in: likedPosts.map((p) => p._id) } }, // Bài từng thích
          ],
        };
        break;

      case "happy":
        // Hiển thị bài happy hoặc excited, ưu tiên từ người follow
        filter = {
          $or: [
            { mood: { $in: ["happy", "excited"] } },
            { userId: { $in: user.followings } },
          ],
        };
        break;

      case "angry":
        // Hiển thị bài neutral hoặc happy để làm dịu, ưu tiên bài ít tương tác tiêu cực
        filter = {
          $or: [
            { mood: { $in: ["neutral", "happy"] } },
            { userId: { $in: user.followings } },
          ],
        };
        break;

      case "excited":
        // Hiển thị tất cả nhưng ưu tiên bài excited hoặc từ người follow
        filter = {
          $or: [{ mood: "excited" }, { userId: { $in: user.followings } }],
        };
        sortOptions = { likes: -1, createdAt: -1 }; // Ưu tiên bài hot
        break;

      case "neutral":
      default:
        // Hiển thị tất cả, ưu tiên bài từ người follow hoặc mới nhất
        filter = {};
        sortOptions = { createdAt: -1 };
        break;
    }

    // Lấy bài viết theo filter
    const posts = await Post.find(filter)
      .populate("userId", "username profilePicture")
      .sort(sortOptions)
      .limit(20); // Giới hạn số lượng bài để tối ưu

    // Thêm comments vào từng bài
    const postWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 });
        return { ...post.toObject(), comments };
      })
    );

    // Logic bổ sung: Nếu người dùng buồn liên tục (>3 ngày), thêm bài hài hước/ngẫu hứng
    const daysSinceLastHappy = user.lastLogin
      ? Math.floor(
          (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24)
        )
      : 0;
    if (user.currentMood === "sad" && daysSinceLastHappy > 3) {
      const inspirationalPosts = await Post.find({ mood: "happy" })
        .sort({ likes: -1 })
        .limit(5); // Lấy 5 bài hot nhất
      postWithComments.push(...inspirationalPosts.map((p) => p.toObject()));
    }

    res.status(200).json(postWithComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() === req.user.id) {
      await post.deleteOne();
      await Comment.deleteMany({ postId: req.params.id });
      res.status(200).json({ message: "Post deleted" });
    } else {
      res.status(403).json({ message: "You can delete only your post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Thiếu postId trong request" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
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
    res.status(500).json({ message: error.message });
  }
};

export const unLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params; // Lấy postId từ params

    if (!postId) {
      return res.status(400).json({ message: "Thiếu postId trong request" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
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
    res.status(500).json({ message: error.message });
  }
};
