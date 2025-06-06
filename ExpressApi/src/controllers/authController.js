import User from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const register = async (req, res) => {
  const { username, email, password, address } = req.body;

  try {
    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin username, email và password",
      });
    }

    // Validate email format using regex
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không đúng định dạng" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Validate password length (optional, for better security)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      address: address || "Việt Nam",
    });

    await user.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, mood } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ message: "Thông tin đăng nhập chưa chính xác" });
    }

    const selectedMood = mood || "neutral";
    user.currentMood = selectedMood;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      token,
      message: "Đăng nhập thành công!",
      currentMood: user.currentMood,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "Không tìm thấy token" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      res.status(401).json({ message: "Token Không hợp lệ" });
    }
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        lastLogout: new Date(),
      });
    }
    res.status(200).json({
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(authUrl);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await googleClient.getToken(code);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, sub: googleId, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name || email.split("@")[0],
        email,
        googleId,
        authProvider: "google",
        currentMood: "neutral",
        address: "Việt Nam",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
    }

    const today = new Date().toDateString();
    if (!user.lastLogin || new Date(user.lastLogin).toDateString() !== today) {
      user.points += 5;
      user.lastLogin = new Date();
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}&points=${user.points}`
    );
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
      username: { $regex: username, $options: "i" },
    }).select("-password");
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

export const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const followId = req.params.id;

    if (userId === followId) {
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

    currentUser.followings.push(followId);
    await currentUser.save();

    userToFollow.followers.push(userId);
    await userToFollow.save();
    res.status(200).json({ message: "Follow success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const unfollowId = req.params.id;

    if (userId === unfollowId) {
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

    currentUser.followings = currentUser.followings.filter(
      (id) => id.toString() !== unfollowId
    );
    await currentUser.save();
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== userId
    );
    await userToUnfollow.save();

    res.status(200).json({ message: "Unfollow success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIntroduce = async (req, res) => {
  try {
    const userId = req.user.id;
    const { introduce } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }
    if (introduce === undefined) {
      return res.status(400).json({ message: "Introduce is required" });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { introduce },
      { new: true }
    ).select("-password");
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }
    if (address === undefined) {
      return res.status(400).json({ message: "Address is required" });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { address },
      { new: true }
    ).select("-password");
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updateUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
