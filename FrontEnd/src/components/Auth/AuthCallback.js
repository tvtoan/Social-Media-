import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleGoogleCallback } from "../../services/authService";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleGoogleCallback();
        // Sau khi lưu token thành công, chuyển hướng về trang chính
        navigate("/home");
      } catch (error) {
        console.error("Error processing Google callback", error);
        navigate("/"); // Chuyển hướng về trang đăng nhập nếu có lỗi
      }
    };

    processCallback();
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
};

export default AuthCallback;
