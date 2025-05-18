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
    const currentMood = user.currentMood || "neutral";

    const followings = Array.isArray(user.followings)
      ? user.followings.map((id) => id.toString())
      : [];
    const likedPosts = await Post.find({ likes: userId }).select("_id");
    const likedPostIds = likedPosts.map((p) => p._id.toString());

    // Xây dựng filter dựa trên tâm trạng
    switch (currentMood) {
      case "happy":
      case "excited":
        filter = {
          $and: [
            // Loại bỏ hoàn toàn các bài viết sad
            { mood: { $ne: "sad" } },
            {
              $or: [
                // Ưu tiên 1: Bài viết cùng tâm trạng
                { mood: { $in: ["happy", "excited"] } },
                // Ưu tiên 2: Bài viết từ người đã follow
                { userId: { $in: followings } },
                // Ưu tiên 3: Bài viết đã thích
                { _id: { $in: likedPostIds } },
                // Các bài viết neutral
                { mood: "neutral" },
              ],
            },
          ],
        };
        break;

      case "sad":
        filter = {
          $and: [
            // Loại bỏ hoàn toàn các bài viết sad và neutral
            { mood: { $nin: ["sad", "neutral"] } },
            {
              $or: [
                // Ưu tiên bài viết vui vẻ để cải thiện tâm trạng
                { mood: { $in: ["happy", "excited"] } },
                // Bài viết từ người đã follow
                { userId: { $in: followings } },
                // Bài viết đã thích
                { _id: { $in: likedPostIds } },
              ],
            },
          ],
        };
        break;

      case "neutral":
      default:
        // Không lọc theo tâm trạng, lấy tất cả bài viết (bao gồm cả sad)
        filter = {};
        break;
    }

    const totalPosts = await Post.countDocuments(filter);
    console.log("Tổng số bài viết:", totalPosts);

    // Tạo pipeline để sắp xếp theo ưu tiên
    let aggregationPipeline;

    if (currentMood === "neutral") {
      // Đối với tâm trạng neutral, chỉ sắp xếp theo thời gian mới nhất
      aggregationPipeline = [
        { $match: filter },
        // Sắp xếp theo thời gian tạo (mới nhất trước)
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
    } else {
      // Đối với các tâm trạng khác, sử dụng logic ưu tiên
      aggregationPipeline = [
        { $match: filter },
        {
          $addFields: {
            // Tính điểm ưu tiên cho mỗi bài viết
            priorityScore: {
              $sum: [
                // Ưu tiên 1: Bài viết cùng tâm trạng với người dùng
                {
                  $cond: [{ $eq: ["$mood", currentMood] }, 100, 0],
                },
                // Ưu tiên 2: Bài viết từ người đã follow
                {
                  $cond: [{ $in: ["$userId", followings] }, 50, 0],
                },
                // Ưu tiên 3: Bài viết đã thích
                {
                  $cond: [{ $in: ["$_id", likedPostIds] }, 25, 0],
                },
                // Ưu tiên 4: Số lượng like (chuẩn hóa)
                {
                  $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 0.1],
                },
              ],
            },
          },
        },
        // Sắp xếp theo điểm ưu tiên (cao đến thấp) và thời gian (mới đến cũ)
        { $sort: { priorityScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
    }

    const posts = await Post.aggregate(aggregationPipeline);

    // Populate userId sau khi aggregate
    await Post.populate(posts, {
      path: "userId",
      select: "username profilePicture",
    });

    const postWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate("userId", "username profilePicture")
          .sort({ createdAt: -1 }); // Sắp xếp bình luận mới nhất trước
        return { ...post, comments };
      })
    );

    // Thêm bài viết truyền cảm hứng cho người dùng buồn
    const daysSinceLastHappy = user.lastLogin
      ? Math.floor(
          (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24)
        )
      : 0;
    if (currentMood === "sad" && daysSinceLastHappy > 3) {
      const existingPostIds = new Set(
        postWithComments.map((p) => p._id.toString())
      );
      const inspirationalPosts = await Post.find({
        mood: "happy",
        _id: { $nin: Array.from(existingPostIds) }, // Loại bỏ các bài viết đã có
      })
        .sort({ likes: -1, createdAt: -1 }) // Nhiều lượt thích nhất, mới nhất
        .limit(2); // Chỉ thêm 2 bài để không làm quá tải

      const inspirationalPostsWithData = await Promise.all(
        inspirationalPosts.map(async (post) => {
          await post.populate("userId", "username profilePicture");
          const comments = await Comment.find({ postId: post._id })
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 });
          return { ...post.toObject(), comments };
        })
      );

      postWithComments.push(...inspirationalPostsWithData);
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
