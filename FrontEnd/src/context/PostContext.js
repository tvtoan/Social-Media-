import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getPosts,
  createPost as createPostService,
  deletePost as deletePostService,
} from "../services/postService";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const newPost = await createPostService(postData);
      setPosts((prevPosts) => [...prevPosts, newPost]);
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await deletePostService(postId);
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
