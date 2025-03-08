import React, { useEffect } from "react";
import Sidebar from "../components/Shared/Sidebar";
import PostList from "../components/Post/PostList";
import StoryList from "../components/Story/StoryList";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.scss";
import classNames from "classnames/bind";
import UserList from "../components/Shared/UserList";
const cx = classNames.bind(styles);

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return navigate("/"); // Chuyển hướng nếu không đăng nhập
  }

  if (loading) {
    return <div>Loading...</div>; // Hiển thị khi đang kiểm tra auth
  }
  return (
    <Layout className={cx("main-container")}>
      <div className={cx("container")}>
        <div className={cx("left-column")}>
          <div className={cx("sidebar-wrapper")}>
            <Sidebar />
          </div>
        </div>
        <div className={cx("middle-column")}>
          <div className={cx("storylist-wrapper")}>
            <StoryList />
          </div>
          <div className={cx("postlist-wrapper")}>
            <PostList />
          </div>
        </div>
        <div className={cx("right-column")}>
          <h2 className={cx("title")}>List friend</h2>
          <UserList />
        </div>
      </div>
    </Layout>
  );
  //
};

export default HomePage;
