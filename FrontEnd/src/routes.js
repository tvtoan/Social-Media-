import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import LoginPage from "./components/Auth/Login";
import RegisterPage from "./components/Auth/Register";
// import VerifyEmailPage from "./components/Auth/VerifyEmail";
import HomePage from "./pages/HomePage";
import InboxPage from "./pages/InboxPage";
import StoryPage from "./pages/StoryPage";
import VideoPage from "./pages/VideoPage";
import ProfilePage from "./pages/ProfilePage";
import AuthCallback from "./components/Auth/AuthCallback";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <PostProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/inbox/:receiverId" element={<InboxPage />} />
          <Route path="/story/:id" element={<StoryPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />

          {/* Route page not found (404) */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </PostProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
