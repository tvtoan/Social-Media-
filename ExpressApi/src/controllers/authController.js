import User from "../model/user";
import bcrypt from "bcryptjs/dist/bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import user from "../model/user";
import multer from "multer";
import path from "path";

dotenv.config();

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

export const getUserByUsername = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const users = await User.find({
      username: { $regex: username, $options: "i" }, // "i" k phan biet chu hoa, chu thuong
    });
    if (users.length === 0) {
      return res.status(404).json({ message: "No user found" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploadPictures");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = `/uploadPictures/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imagePath },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoverPicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = `/uploadPictures/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { coverPicture: imagePath },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadSingle = upload.single("image");

// Follow
export const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const followId = req.params.id;

    if (user === followId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    const userToFollow = await User.findById(followId);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.followings.includes(followId)) {
      return res.status(400).json({ message: "You already follow this user" });
    }
    await User.findByIdAndUpdate(userId, { $push: { followings: followId } });
    await User.findByIdAndUpdate(followId, { $push: { followers: userId } });
    res.status(200).json({ message: "Follow success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const unfollowId = req.params.id;

    if (user === unfollowId) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }
    const userToUnfollow = await User.findById(unfollowId);
    const currentUser = await User.findById(userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!currentUser.followings.includes(unfollowId)) {
      return res.status(400).json({ message: "You don't follow this user" });
    }
    await User.findByIdAndUpdate(userId, { $pull: { followings: unfollowId } });
    await User.findByIdAndUpdate(unfollowId, { $pull: { followers: userId } });
    res.status(200).json({ message: "Unfollow success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Introduce
export const updateIntroduce = async (req, res) => {
  try {
    const userId = req.user.id;
    const { introduce } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { introduce },
      { new: true }
    );
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
