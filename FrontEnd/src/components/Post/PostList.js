import React, { useEffect, useState, useCallback } from "react";
import { getPostByMood, getPosts } from "../../services/postService";
import Post from "./Post";
import CreatePost from "./CreatePost";

const PostList = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPostsByMood = useCallback(async () => {
    try {
      setLoading(true);
      const moodPosts = await getPostByMood("natural");
      console.log(moodPosts);
    } catch (error) {
      console.error("Error fetching posts by mood", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostsByMood();
  }, [fetchPostsByMood]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data.reverse());
    } catch (error) {
      console.error("Error fetching posts", error);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = async (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    await fetchPosts(); // Gọi lại API để lấy danh sách mới nhất
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
