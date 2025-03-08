import React, { createContext, useContext, useEffect, useState } from "react";
import { getPosts, createPost, deletePost } from "../services/postService";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
      setError("Failed to fetch posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const newPost = await createPost(postData);
      setPosts((prevPosts) => [...prevPosts, newPost]);
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostContext.Provider
      value={{ posts, loading, fetchPosts, createPost, deletePost }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  return useContext(PostContext);
};
