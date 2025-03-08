import axios from "axios";

const API_URL = "http://localhost:3001/api/posts";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const createPost = async (formData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.post("", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Create post failed",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getPosts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching posts",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.get(`/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching post with ID: ${postId}`,
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getPostsByUserId = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts", error.message);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.delete(`/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting post with ID: ${postId}`);
    throw error;
  }
};
