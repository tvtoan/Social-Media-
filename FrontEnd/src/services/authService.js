import axios from "axios";

const API_URL = "http://localhost:3001/api/auth";

export const googleAuth = async () => {
  try {
    // Chuyển hướng người dùng đến endpoint /api/auth/google
    window.location.href = `${API_URL}/google`;
  } catch (error) {
    console.error("Google Authentication failed", error.message);
    throw error;
  }
};

// Hàm xử lý callback từ Google OAuth (sẽ được gọi từ AuthCallback component)
export const handleGoogleCallback = async () => {
  try {
    // Lấy token và points từ query parameters trong URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const points = params.get("points");

    if (!token) {
      throw new Error("No token found in callback URL");
    }

    // Lưu token vào localStorage
    localStorage.setItem("token", token);
    return { token, points };
  } catch (error) {
    console.error("Error handling Google callback", error.message);
    throw error;
  }
};
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error register user",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error(
      "Login failed",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const logout = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // xoá cookie nếu có
      }
    );
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    console.error("Đăng xuất thất bại", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(`${API_URL}/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching current user",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all users", error.message);
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/user`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user by username",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by id", error);
    throw error;
  }
};

export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(`${API_URL}/profile-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profilePicture", error);
    throw error;
  }
};

export const updateCoverPicture = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(`${API_URL}/cover-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cover picture", error);
    throw error;
  }
};

export const followUser = async (userId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/follow/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error following user", error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${API_URL}/unfollow/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error unfollowing user", error);
    throw error;
  }
};

export const updateIntroduce = async (introduce) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${API_URL}/introduce`,
      { introduce },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating introduce", error);
    throw error;
  }
};
