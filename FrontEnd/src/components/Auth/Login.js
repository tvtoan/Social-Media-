import React, { useState } from "react";
import { googleAuth, login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mood, setMood] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const moodOptions = [
    { value: "happy", label: "😊 Vui vẻ", color: "bg-yellow-200" },
    { value: "sad", label: "😢 Buồn", color: "bg-blue-200" },
    { value: "excited", label: "🤩 Hào hứng", color: "bg-green-200" },
    { value: "neutral", label: "😐 Bình thường", color: "bg-gray-200" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password, mood);
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        window.location.href = "/home";
      }
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Đăng nhập thất bại, vui lòng thử lại."
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError("Đăng nhập bằng Google thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className={cx("login-page")}>
      <div className={cx("left-section")}>
        <h1 className={cx("logo")}>NEXUS</h1>
        <p className={cx("description")}>
          Cùng nhau xây dựng những khoảng khắc & Kết nối không giới hạn
        </p>
        <div className={cx("img")}>
          <img
            style={{ width: "450px", height: "auto" }}
            src="images/login.jpg"
            alt="login"
          />
        </div>
      </div>
      <div className={cx("right-section")}>
        <form onSubmit={handleLogin} className={cx("form")}>
          <div className={cx("title")}>Chào mừng </div>
          <div className={cx("title")}>Bạn quay trở lại</div>
          <div className={cx("title-name")}>NEXUS</div>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cx("input")}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cx("input")}
          />
          {error && <div className={cx("error-message")}>{error}</div>}
          <a href="/" className={cx("forgot-password")}>
            Bạn quên mật khẩu?
          </a>
          <div className={cx("mood-section")}>
            <label className={cx("mood-label")}>
              Bạn đang cảm thấy thế nào?
            </label>
            <div className={cx("mood-options")}>
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={cx("mood-button", option.className, {
                    "mood-selected": mood === option.value,
                  })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className={cx("login-button")}>
            Đăng nhập
          </button>
          <div className={cx("line")}></div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={cx("google-login-button")}
            style={{
              backgroundColor: "#fff",
              color: "#000",
              border: "1px solid #ccc",
              padding: "10px",
              margin: "0px 0 20px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              borderRadius: "25px",
            }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              style={{ width: "20px", height: "20px" }}
            />
            Đăng nhập bằng Google
          </button>
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <p>Bạn chưa có tài khoản?</p>
            <p
              style={{ color: "#2684FC", cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              Tạo tài khoản ngay
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
