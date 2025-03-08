import Post from "../model/post.js";
import Comment from "../model/comment.js";

export const createPost = async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      likes: req.body.likes || [],
    });

    const savedPost = await newPost.save();

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
    const comments = await Comment.find({postId: req.params.id}).populate('userId','username profilePicture').sort({createAt: -1})
    res.status(200).json({...post.toObject(), comments});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username profilePicture");
      const postWithComments = await Promise.all(posts.map(async(post) => {
        const comments = await Comment.find({postId: post._id})
        .populate('userId', 'username profilePicture')
        .sort({createAt: -1});
        return {...post.toObject(), comments};
      }))
    res.status(200).json(postWithComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "username profilePicture");
    const postWithComments = await Promise.all(posts.map(async(post) => {
      const comments = await Comment.find({postId: post._id})
        .populate('userId', 'username profilePicture')
        .sort({createAt: -1});
        return {...post.toObject(), comments}
    }))
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
      await Comment.deleteMany({postId: req.params.id});
      res.status(200).json({ message: "Post deleted" });
    } else {
      res.status(403).json({ message: "You can delete only your post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
