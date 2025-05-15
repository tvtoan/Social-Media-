import React, { useEffect } from "react";
import { usePost } from "../../context/PostContext";
import Post from "./Post";
import CreatePost from "./CreatePost";
import styles from "./PostList.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const PostList = ({ userId, containerRef }) => {
  const {
    posts,
    loading,
    isInitialLoading,
    error,
    page,
    totalPages,
    isLoadingMore,
    setPage,
    fetchPostsByMood,
    handlePostCreated,
    handlePostUpdated,
  } = usePost();

  useEffect(() => {
    if (posts.length === 0 && isInitialLoading) {
      fetchPostsByMood(1);
    }
  }, [fetchPostsByMood, posts.length, isInitialLoading]);

  useEffect(() => {
    if (!containerRef?.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      const threshold = 200;

      if (
        clientHeight + scrollTop >= scrollHeight - threshold &&
        !isLoadingMore &&
        page < totalPages
      ) {
        console.log(`Kích hoạt tải thêm: page=${page + 1}`);
        setPage((prevPage) => {
          const newPage = prevPage + 1;
          fetchPostsByMood(newPage);
          return newPage;
        });
      }
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, isLoadingMore, fetchPostsByMood, containerRef]);

  if (loading && isInitialLoading) return <div>Đang tải bài đăng...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <CreatePost onPostCreated={handlePostCreated} userId={userId} />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li key={post._id}>
            <Post post={post} onPostUpdated={handlePostUpdated} />
          </li>
        ))}
      </ul>
      {isLoadingMore && (
        <div className={cx("text")}>Đang tải thêm bài viết...</div>
      )}
    </div>
  );
};

export default PostList;
