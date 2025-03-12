import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import classNames from "classnames/bind";
import { useAuth } from "../../context/AuthContext";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);
const Sidebar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  console.log(user.introduce);

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
        <li style={{ display: "flex", marginLeft: "10px" }}>
          <img
            src={
              user.profilePicture
                ? `http://localhost:3001${user?.profilePicture}`
                : defaultAvt
            }
            className={cx("img")}
          />
          <p className={cx("username")}>{user.username}</p>
        </li>
        <div className={cx("profile")}>
          <img
            src={
              user.profilePicture
                ? `http://localhost:3001${user?.coverPicture}`
                : defaultAvt
            }
            alt="CoverPicture"
            className={cx("cover-picture")}
          />
          <img
            src={
              user.profilePicture
                ? `http://localhost:3001${user?.profilePicture}`
                : defaultAvt
            }
            alt="profilePicture"
            className={cx("profile-picture")}
          />
          <div>{user.username}</div>
          <div>{user.followers.length} Followers</div>
          <div>{user.followings.length} Followings</div>
          <div>{user.introduce} Introduce</div>
          <button>My Profile</button>
        </div>
      </ul>
    </aside>
  );
};

export default Sidebar;
