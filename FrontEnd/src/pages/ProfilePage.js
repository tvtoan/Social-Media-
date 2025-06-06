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
  updateIntroduce,
  updateAddress,
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
  const [isEditingIntroduce, setIsEditingIntroduce] = useState(false);
  const [introduceInput, setIntroduceInput] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");

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
      setIntroduceInput(data.introduce || "");
      setAddressInput(data.address || "");
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

  const handleEditIntroduce = () => {
    setIsEditingIntroduce(true);
  };

  const handleSaveIntroduce = async () => {
    try {
      const updatedUser = await updateIntroduce(introduceInput);
      setUserData((prev) => ({ ...prev, introduce: updatedUser.introduce }));
      setIsEditingIntroduce(false);
      if (id === user._id) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error saving introduce:", error.response?.data || error);
      setError("Không thể cập nhật giới thiệu.");
    }
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    try {
      const updatedUser = await updateAddress(addressInput);
      setUserData((prev) => ({ ...prev, address: updatedUser.address }));
      setIsEditingAddress(false);
      if (id === user._id) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Error saving address:", error.response?.data || error);
      setError("Không thể cập nhật địa chỉ.");
    }
  };

  const handleIntroduceChange = (e) => {
    setIntroduceInput(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddressInput(e.target.value);
  };

  const handlePostCreated = useCallback((newPost) => {
    setUserPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  const handlePostUpdated = useCallback((updatedPost) => {
    setUserPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  }, []);

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
                ? `https://social-media-7uo4.onrender.com${userData.coverPicture}`
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
                ? `https://social-media-7uo4.onrender.com${userData.profilePicture}`
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
          <div className={cx("follower-info")}>
            <p>{userData?.followers.length} followers</p>
            <p>{userData?.followings.length} followings</p>
          </div>

          <div className={cx("address")}>
            {isEditingAddress ? (
              <div className={cx("address-container")}>
                <input
                  type="text"
                  value={addressInput}
                  onChange={handleAddressChange}
                  placeholder="Nhập địa chỉ..."
                  className={cx("address-input")}
                />
                <button
                  onClick={handleSaveAddress}
                  className={cx("address-button", "save")}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className={cx("address-container")}>
                <p className={cx("address-text")}>
                  {userData?.address || "Chưa có địa chỉ"}
                </p>
                {user?._id === id && (
                  <button
                    onClick={handleEditAddress}
                    className={cx("address-button", "edit")}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={cx("introduce")}>
            {isEditingIntroduce ? (
              <div className={cx("introduce-container")}>
                <input
                  type="text"
                  value={introduceInput}
                  onChange={handleIntroduceChange}
                  placeholder="Nhập giới thiệu..."
                  className={cx("introduce-input")}
                />
                <button
                  onClick={handleSaveIntroduce}
                  className={cx("introduce-button", "save")}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className={cx("introduce-container")}>
                <p className={cx("introduce-text")}>
                  {userData?.introduce ||
                    "Lao động hết mình, may mắn sẽ tìm đến"}
                </p>
                {user?._id === id && (
                  <button
                    onClick={handleEditIntroduce}
                    className={cx("introduce-button", "edit")}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
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
                <Post post={post} onPostUpdated={handlePostUpdated} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
