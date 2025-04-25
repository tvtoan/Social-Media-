import React, { useEffect, useState, useCallback } from "react";
import { getPostByMood } from "../../services/postService";
import { useAuth } from "../../context/AuthContext";
import Post from "./Post";
import CreatePost from "./CreatePost";

const PostList = ({ userId }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPostsByMood = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostByMood();
      setPosts(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching posts", error);
      setError("Không thể tải bài đăng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostsByMood();
  }, [fetchPostsByMood]);

  const handlePostCreated = useCallback(
    async (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      try {
        await fetchPostsByMood();
      } catch (error) {
        console.error("Error refreshing posts:", error);
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

  if (loading) return <div>Đang tải bài đăng...</div>;
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
    </div>
  );
};

export default PostList;
