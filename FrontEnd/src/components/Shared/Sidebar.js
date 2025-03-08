import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import classNames from "classnames/bind";
import {
  FaUserFriends,
  FaFacebookMessenger,
  FaStore,
  FaGamepad,
  FaNewspaper,
  FaGift,
} from "react-icons/fa";
import { MdOndemandVideo, MdGroups, MdEmojiEvents } from "react-icons/md";
import { IoIosTimer } from "react-icons/io";
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
        <li className={cx("link")}>
          <MdOndemandVideo />
          <Link to="/home" className={cx("title")}>
            Video
          </Link>
        </li>
        <li className={cx("link")}>
          <FaFacebookMessenger />
          <Link to="/inbox/:id" className={cx("title")}>
            Inbox
          </Link>
        </li>
        <li className={cx("link")}>
          <FaUserFriends />
          <Link to="" className={cx("title")}>
            Friend
          </Link>
        </li>
        <li className={cx("link")}>
          <FaStore />
          <Link to="/video" className={cx("title")}>
            Market
          </Link>
        </li>
        <li className={cx("link")}>
          <IoIosTimer />
          <Link to="" className={cx("title")}>
            Memories
          </Link>
        </li>
        <li className={cx("link")}>
          <MdGroups />
          <Link to="" className={cx("title")}>
            Group
          </Link>
        </li>
        <li className={cx("link")}>
          <FaNewspaper />
          <Link to="" className={cx("title")}>
            NewsFeed
          </Link>
        </li>
        <li className={cx("link")}>
          <FaGamepad />
          <Link to="" className={cx("title")}>
            Play Games
          </Link>
        </li>
        <li className={cx("link")}>
          <MdEmojiEvents />
          <Link to="" className={cx("title")}>
            Events
          </Link>
        </li>
        <li className={cx("link")}>
          <FaGift />
          <Link to="" className={cx("title")}>
            Birthday Gift
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
