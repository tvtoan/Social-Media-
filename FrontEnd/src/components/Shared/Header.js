import React, { useState, useEffect, useRef } from "react";
import styles from "./Header.module.scss";
import classNames from "classnames/bind";
import {
  FaUserFriends,
  FaFacebookMessenger,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { AiFillHome, AiOutlineLogout } from "react-icons/ai";
import { getUserByUsername, logout } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/themeContext";
import { useNavigate, useLocation } from "react-router-dom";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);

const menuItems = [
  { name: "home", icon: <AiFillHome />, path: "/home" },
  { name: "video", icon: <PiVideoFill />, path: "/video" },
  { name: "friend", icon: <FaUserFriends />, path: "/home" },
  { name: "message", icon: <FaFacebookMessenger />, path: "/inbox/:id" },
  { name: "notification", icon: <FaBell />, path: "/home" },
];

const Header = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("home");
  const searchRef = useRef(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenu =
      menuItems.find((item) => item.path === currentPath)?.name || "home";
    setActive(activeMenu);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value.trim().toLowerCase();
    setSearchTerm(query);
    if (query) {
      try {
        const results = await getUserByUsername(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleInputClick = () => {
    if (searchResults.length > 0 || searchTerm) {
      setShowSearchResults(true);
    }
  };

  const handleLogout = async () => {
    try {
      const confirmLogout = window.confirm("Bạn có muốn đăng xuất không?");
      if (!confirmLogout) return;
      await logout();
      alert("Đăng xuất thành công!");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert(`Đăng xuất thất bại: ${error.message}`);
    }
  };

  return (
    <div className={cx("header")}>
      <div className={cx("header-left")}>
        <img src="/images/logo.jpg" alt="logo" className={cx("img")} />
        <div className={cx("header-search")} ref={searchRef}>
          <FaSearch className={cx("header-icon")} style={{ padding: "10px" }} />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={handleSearch}
            onClick={handleInputClick}
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className={cx("search-results")}>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={cx("search-result-item")}
                  onClick={() => navigate(`/profile/${user._id}`)} 
                  style={{ cursor: "pointer" }} 
                >
                  <img
                    src={
                      user.profilePicture
                        ? `http://localhost:3001${user?.profilePicture}`
                        : defaultAvt
                    }
                    alt="profile"
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
        <img
          src={
            user?.profilePicture
              ? `http://localhost:3001${user?.profilePicture}`
              : defaultAvt
          }
          alt="profile"
          className={cx("img")}
          onClick={() => navigate(`/profile/${user?._id}`)}
        />
        <div className={cx("theme-toggle")} onClick={toggleTheme}>
          {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
        </div>
        <AiOutlineLogout onClick={handleLogout} className={cx("logout")} />
      </div>
    </div>
  );
};

export default Header;
