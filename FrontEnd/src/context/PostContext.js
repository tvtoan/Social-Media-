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
        setPosts((prevPosts) =>
          pageNum === 1 ? data.posts : [...prevPosts, ...data.posts]
        );
        setTotalPages(data.totalPages);
        setError(null);
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

  const handlePostCreated = useCallback(
    async (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      try {
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

  const resetPosts = useCallback(() => {
    setPosts([]);
    setPage(1);
    setTotalPages(1);
    setIsInitialLoading(true);
    setError(null);
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
