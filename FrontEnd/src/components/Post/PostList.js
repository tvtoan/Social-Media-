import React, { useEffect, useState, useCallback } from "react";
import { getPostByMood } from "../../services/postService";
import Post from "./Post";
import CreatePost from "./CreatePost";

const PostList = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(posts);

  const fetchPostsByMood = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostByMood();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts", error);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostsByMood();
  }, [fetchPostsByMood]);

  const handlePostCreated = async (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    await fetchPostsByMood(); // Gọi lại API để lấy danh sách mới nhất
  };

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

  if (loading) return <div>Loading posts...</div>;
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
