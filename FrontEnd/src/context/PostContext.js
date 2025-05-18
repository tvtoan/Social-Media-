import React, { createContext, useContext, useState, useCallback } from "react";
import { getPostByMood } from "../services/postService";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPostsByMood = useCallback(
    async (pageNum, isRefresh = false) => {
      try {
        if (isInitialLoading && pageNum === 1 && !isRefresh) {
          setLoading(true);
        }
        setIsLoadingMore(pageNum > 1);
        const data = await getPostByMood(pageNum);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setPosts((prevPosts) => {
          const newPosts =
            pageNum === 1 ? data.posts : [...prevPosts, ...data.posts];
          // Loại bỏ trùng lặp dựa trên _id
          const uniquePosts = Array.from(
            new Map(newPosts.map((post) => [post._id, post])).values()
          );
          console.log(
            "Unique posts in state:",
            uniquePosts.map((p) => ({ _id: p._id, mood: p.mood }))
          );
          return uniquePosts;
        });

        setTotalPages(data.totalPages);
        setError(null);
        if (isInitialLoading && pageNum === 1) {
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

  const handlePostCreated = useCallback(
    async (newPost) => {
      setPosts((prevPosts) => {
        // Kiểm tra xem bài viết đã tồn tại chưa
        if (prevPosts.some((post) => post._id === newPost._id)) {
          console.log("Bài viết đã tồn tại, không thêm:", newPost._id);
          return prevPosts;
        }
        console.log("Thêm bài viết mới:", newPost._id);
        return [newPost, ...prevPosts];
      });
      try {
        // Làm mới danh sách bài viết từ trang 1
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
        const newPosts = updatedPostOrFunction(prevPosts);
        // Loại bỏ trùng lặp sau khi áp dụng hàm
        const uniquePosts = Array.from(
          new Map(newPosts.map((post) => [post._id, post])).values()
        );
        console.log(
          "Posts sau update (function):",
          uniquePosts.map((p) => p._id)
        );
        return uniquePosts;
      }
      if (Array.isArray(updatedPostOrFunction)) {
        // Loại bỏ trùng lặp nếu là mảng
        const uniquePosts = Array.from(
          new Map(
            updatedPostOrFunction.map((post) => [post._id, post])
          ).values()
        );
        console.log(
          "Posts sau update (array):",
          uniquePosts.map((p) => p._id)
        );
        return uniquePosts;
      }
      // Cập nhật bài viết đơn
      const newPosts = prevPosts.map((post) =>
        post._id === updatedPostOrFunction._id ? updatedPostOrFunction : post
      );
      console.log(
        "Posts sau update (single):",
        newPosts.map((p) => p._id)
      );
      return newPosts;
    });
  }, []);

  const resetPosts = useCallback(() => {
    setPosts([]);
    setPage(1);
    setTotalPages(1);
    setIsInitialLoading(true);
    setError(null);
    console.log("Đã reset trạng thái posts");
  }, []);

  return (
    <PostContext.Provider
      value={{
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
        resetPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
