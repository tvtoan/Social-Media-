import axios from "axios";

const API_URL = "http://localhost:3001/api/comments";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const addComment = async (postId, commentData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.post(`/${postId}`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding comment",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.put(`/${commentId}`, commentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating comment",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axiosInstance.delete(`/${commentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting comment",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getCommentsByPostId = async (postId) => {
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
      "Error fetching comments for post Id",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
