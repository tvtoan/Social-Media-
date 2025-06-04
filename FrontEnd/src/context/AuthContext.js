// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService"; // Giả sử bạn có một service để xử lý các yêu cầu liên quan đến người dùng

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (userData) => {
    const response = await authService.login(userData);
    setUser(response);
    localStorage.setItem("token", response.token); // Lưu token từ response
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("token");
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error refreshing user", error);
      }
    }
  };

  // Lấy danh sách người dùng
  const getAllUsers = async () => {
    try {
      const users = await authService.getUsers();
      return users;
    } catch (error) {
      console.error("Error fetching users", error);
      throw error;
    }
  };

  // Xóa người dùng
  const deleteUser = async (userId) => {
    try {
      await authService.deleteUser(userId);
    } catch (error) {
      console.error("Error deleting user", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        getAllUsers,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
