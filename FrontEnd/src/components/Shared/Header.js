import React, { useState, useEffect } from "react";
import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import {
  FaUserFriends,
  FaStore,
  FaFacebookMessenger,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa6";
import { PiVideoFill } from "react-icons/pi";
import { MdOutlineGroup } from "react-icons/md";
import { AiFillHome } from "react-icons/ai";

import { getUserByUsername } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);

const Header = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("home");

  useEffect(() => {
    // Cập nhật trạng thái active khi URL thay đổi
    const currentPath = location.pathname;
    const activeMenu = menuItems.find((item) => item.path === currentPath)?.name || "home";
    setActive(activeMenu);
  }, [location]);

  const handleSearch = async (e) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchTerm(query);

    if (query) {
      try {
        const results = await getUserByUsername(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const menuItems = [
    { name: "home", icon: <AiFillHome />, path: "/home" },
    { name: "friend", icon: <FaUserFriends />, path: "/home" },
    { name: "video", icon: <PiVideoFill />, path: "/video" },
    { name: "store", icon: <FaStore />, path: "/home" },
    { name: "group", icon: <MdOutlineGroup />, path: "/inbox/:id" },
  ];

  return (
    <div className={cx("header")}>
      <div className={cx("header-left")}>
        <FaFacebookF className={cx("header-logo")} />
        <div className={cx("header-search")}>
          <FaSearch className={cx("header-icon")} style={{ padding: "10px" }} />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <div className={cx("search-results")}>
              {searchResults.map((user) => (
                <div key={user._id} className={cx("search-result-item")}>
                  <img
                    src={
                      user.profilePicture
                        ? `http://localhost:3001${user?.profilePicture}`
                        : defaultAvt
                    }
                    className={cx("img")}
                  />
                  {user.username}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={cx("header-center")}>
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={cx("header-options", { active: active === item.name })}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </div>
        ))}
      </div>
      <div className={cx("header-right")}>
        <FaFacebookMessenger
          className={cx("header-icon")}
          onClick={() => navigate("/inbox/:id")}
        />
        <FaBell className={cx("header-icon")} />
        <img
          src={
            user?.profilePicture
              ? `http://localhost:3001${user?.profilePicture}`
              : defaultAvt
          }
          className={cx("img")}
          onClick={() => navigate(`/profile/${user?._id}`)}
        />
      </div>
    </div>
  );
};

export default Header;
