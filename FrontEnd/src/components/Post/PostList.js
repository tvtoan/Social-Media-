import React, { useEffect, useState, useCallback } from "react";
import { getPostByMood } from "../../services/postService";
import Post from "./Post";
import CreatePost from "./CreatePost";
import styles from "./PostList.module.scss";
import classNames from "classnames/bind";

const PostList = ({ userId, containerRef }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Chỉ dùng cho lần tải đầu
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cx = classNames.bind(styles);

  const fetchPostsByMood = useCallback(
    async (pageNum, isRefresh = false) => {
      try {
        console.log(`Tải bài viết: page=${pageNum}`);
        if (isInitialLoading && pageNum === 1 && !isRefresh) {
          setLoading(true);
        }
        setIsLoadingMore(pageNum > 1);
        const data = await getPostByMood(pageNum);
        console.log("Dữ liệu API:", {
          posts: data.posts.length,
          totalPages: data.totalPages,
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setPosts((prevPosts) =>
          pageNum === 1 ? data.posts : [...prevPosts, ...data.posts]
        );
        setTotalPages(data.totalPages);
        setError(null);

        // Sau lần tải đầu, đặt isInitialLoading thành false
        if (isInitialLoading) {
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
        setError("Không thể tải bài đăng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isInitialLoading]
  );

  useEffect(() => {
    fetchPostsByMood(1);
  }, [fetchPostsByMood]);

  useEffect(() => {
    if (!containerRef?.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      const threshold = 200;

      console.log(
        `Cuộn: scrollTop=${scrollTop}, clientHeight=${clientHeight}, scrollHeight=${scrollHeight}, page=${page}, totalPages=${totalPages}`
      );

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

  const handlePostCreated = useCallback(
    async (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      try {
        // Gọi fetchPostsByMood với isRefresh=true để không bật loading
        await fetchPostsByMood(1, true);
      } catch (error) {
        console.error("Lỗi làm mới bài viết:", error);
        setError("Không thể làm mới danh sách bài đăng.");
      }
    },
    [fetchPostsByMood]
  );

  const handlePostUpdated = useCallback((updatedPostOrFunction) => {
    setPosts((prevPosts) => {
      if (typeof updatedPostOrFunction === "function") {
        return updatedPostOrFunction(prevPosts);
      }
      if (Array.isArray(updatedPostOrFunction)) {
        return updatedPostOrFunction;
      }
      return prevPosts.map((post) =>
        post._id === updatedPostOrFunction._id ? updatedPostOrFunction : post
      );
    });
  }, []);

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
