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
  const { user, loading } = useAuth();
  const { userId: id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followings, setFollowings] = useState(null);
  const navigate = useNavigate();
  console.log("user", user);

  const profilePictureRef = useRef(null);
  const coverPictureRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // get info user
  const fetchUserData = useCallback(async () => {
    try {
      if (!id || !user) return;
      const data = await getUserById(id);
      setUserData(data);
      setFollowings(data.followers.includes(user?._id));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [id, user]);

  // get posts list
  const fetchUserPosts = async () => {
    try {
      if (!id) return;
      const posts = await getPostsByUserId(id);
      setUserPosts(posts.reverse());
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [id, user, fetchUserData, fetchUserPosts]);

  const handleFollowToggle = async () => {
    if (id === user?._id) {
      console.error("Bạn không thể tự follow chính mình.");
      return;
    }
    try {
      let updateFollowing;
      if (followings) {
        await unfollowUser(id);
        updateFollowing = false;
      } else {
        await followUser(id);
        updateFollowing = true;
      }
      setFollowings(updateFollowing);
      setUserData((prev) => ({
        ...prev,
        followers: updateFollowing
          ? [...prev.followers, user?._id]
          : prev.followers.filter((followerId) => followerId !== user?._id),
      }));
    } catch (error) {
      console.error("Error following user:", error);
    }
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
        setUserData(updatedUser); // Update info user
      } catch (error) {
        console.error("Error updating profile picture:", error);
      }
    }
  };

  const handleCoverPictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const updatedUser = await updateCoverPicture(file);
        setUserData(updatedUser);
      } catch (error) {
        console.error("Error updating cover picture:", error);
      }
    }
  };

  const handlePostCreated = (newPost) => {
    setUserPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  if (!user) {
    return <p>You must log in to view this page</p>;
  }

  return (
    <Layout>
      <div className={cx("profile-page")}>
        {/* Cover Picture */}
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

        {/* User Info */}
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

        {/* User Actions */}
        <div>
          {user?.id !== id && (
            <button
              className={cx("follow-button", { following: followings })}
              onClick={handleFollowToggle}
            >
              {followings ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        {/* User Posts */}
        <div className={cx("user-posts")}>
          <CreatePost onPostCreated={handlePostCreated} userId={id} />
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
