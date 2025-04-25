import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ProfilePage.module.scss";
import classNames from "classnames/bind";
import { useAuth } from "../context/AuthContext";
import {
  followUser,
  getUserById,
  unfollowUser,
  updateCoverPicture,
  updateProfilePicture,
} from "../services/authService";
import { getPostsByUserId } from "../services/postService";
import Layout from "../components/Layout/Layout";
import Post from "../components/Post/Post";
import CreatePost from "../components/Post/CreatePost";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosCamera } from "react-icons/io";
import defaultAvt from "../img/default.jpg";

const cx = classNames.bind(styles);

const ProfilePage = () => {
  const { user, loading, refreshUser } = useAuth();
  const { userId: id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followings, setFollowings] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const profilePictureRef = useRef(null);
  const coverPictureRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      if (!id || !user) return;
      const data = await getUserById(id);
      setUserData(data);
      setFollowings(data.followers.includes(user?._id));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Không thể tải dữ liệu người dùng.");
    }
  }, [id, user]);

  const fetchUserPosts = useCallback(async () => {
    try {
      if (!id) return;
      const posts = await getPostsByUserId(id);
      setUserPosts(posts.reverse());
      setError("");
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setError("Không thể tải danh sách bài đăng.");
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [id, user, fetchUserData, fetchUserPosts]);

  const handleFollow = async () => {
    if (id === user?._id) {
      console.error("Bạn không thể tự follow chính mình.");
      return;
    }
    try {
      await followUser(id);
      setFollowings(true);
      setUserData((prev) => ({
        ...prev,
        followers: [...prev.followers, user._id],
      }));
      await refreshUser();
    } catch (error) {
      console.error("Error following user:", error);
      setError("Không thể follow người dùng.");
    }
  };

  const handleUnfollow = async () => {
    if (id === user?._id) {
      console.error("Bạn không thể tự unfollow chính mình.");
      return;
    }
    try {
      await unfollowUser(id);
      setFollowings(false);
      setUserData((prev) => ({
        ...prev,
        followers: prev.followers.filter((follower) => follower !== user._id),
      }));
      await refreshUser();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      setError("Không thể unfollow người dùng.");
    }
  };

  const handleToggle = () => {
    followings ? handleUnfollow() : handleFollow();
  };

  const handleProfileClick = () => {
    profilePictureRef.current?.click();
  };

  const handleCoverClick = () => {
    coverPictureRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const updatedUser = await updateProfilePicture(file);
        setUserData(updatedUser);
        if (id === user._id) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        setError("Không thể cập nhật ảnh đại diện.");
      }
    }
  };

  const handleCoverPictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const updatedUser = await updateCoverPicture(file);
        setUserData(updatedUser);
        if (id === user._id) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error updating cover picture:", error);
        setError("Không thể cập nhật ảnh bìa.");
      }
    }
  };

  const handlePostCreated = useCallback(
    (newPost) => {
      setUserPosts((prevPosts) => [newPost, ...prevPosts]);
      fetchUserPosts().catch((error) => {
        console.error("Error refreshing posts:", error);
        setError("Không thể làm mới danh sách bài đăng.");
      });
    },
    [fetchUserPosts]
  );

  if (!user) {
    return <p>Bạn cần đăng nhập để xem trang này</p>;
  }

  return (
    <Layout>
      <div className={cx("profile-page")}>
        {error && <p className={cx("error")}>{error}</p>}
        <div className={cx("cover-picture")}>
          <img
            src={
              userData?.coverPicture
                ? `http://localhost:3001${userData.coverPicture}`
                : "/default-cover.jpg"
            }
            alt="Cover"
            className={cx("cover-img")}
          />
          <input
            ref={coverPictureRef}
            type="file"
            accept="image/*"
            onChange={handleCoverPictureChange}
            className={cx("upload-input")}
          />
          <button onClick={handleCoverClick} className={cx("custom-cover")}>
            <IoIosCamera />
          </button>
        </div>
        <div className={cx("user-info")}>
          <img
            src={
              userData?.profilePicture
                ? `http://localhost:3001${userData.profilePicture}`
                : defaultAvt
            }
            alt="Avatar"
            className={cx("avatar")}
          />
          <input
            ref={profilePictureRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className={cx("upload-input")}
          />
          <button onClick={handleProfileClick} className={cx("custom-profile")}>
            <IoIosCamera />
          </button>
          <p className={cx("username")}>{userData?.username}</p>
        </div>
        <div>
          {user?._id !== id && (
            <button
              className={cx("follow-button", { following: followings })}
              onClick={handleToggle}
            >
              {followings ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
        <div className={cx("user-posts")}>
          <CreatePost onPostCreated={handlePostCreated} userId={user._id} />
          <ul style={{ listStyle: "none" }}>
            {userPosts.map((post) => (
              <li key={post._id}>
                <Post post={post} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
