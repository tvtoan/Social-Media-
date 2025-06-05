import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import classNames from "classnames/bind";
import { useAuth } from "../../context/AuthContext";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);
const Sidebar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }
  return (
    <aside className={cx("sidebar")}>
      <ul>
        <div className={cx("profile")}>
          <img
            src={
              user.coverPicture
                ? `https://social-media-7uo4.onrender.com${user.coverPicture}`
                : defaultAvt
            }
            alt="CoverPicture"
            className={cx("cover-picture")}
          />
          <img
            src={
              user.profilePicture
                ? `https://social-media-7uo4.onrender.com${user.profilePicture}`
                : defaultAvt
            }
            alt="ProfilePicture"
            className={cx("profile-picture")}
          />
          <div className={cx("username")}>{user.username}</div>
          <div className={cx("email")}>{user.email}</div>
          <div className={cx("address")}>
            Địa chỉ: {user.address || "Chưa có địa chỉ"}
          </div>
          <div className={cx("follower")}>
            {user.followers.length} Followers
          </div>
          <div className={cx("following")}>
            {user.followings.length} Followings
          </div>
          <div className={cx("introduce")}>
            {user.introduce || "Lao động hết mình, May mắn sẽ tìm đến"}
          </div>
          <button
            className={cx("button")}
            onClick={() => navigate(`/profile/${user?._id}`)}
          >
            My Profile
          </button>
        </div>
      </ul>
      <div className={cx("line")}></div>
    </aside>
  );
};

export default Sidebar;
