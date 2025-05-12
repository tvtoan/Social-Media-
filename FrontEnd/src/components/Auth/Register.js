import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import styles from "./Register.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state

    // Client-side email validation
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Email không đúng định dạng ");
      return;
    }

    try {
      await register({ username: name, email, password });
      navigate("/");
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Đăng ký thất bại, vui lòng thử lại."
      );
    }
  };

  return (
    <div className={cx("register-page")}>
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
        <form className={cx("form")} onSubmit={handleRegister}>
          <div className={cx("title")}>Tham gia</div>
          <div className={cx("title-name")}>NEXUS</div>
          <input
            type="text"
            placeholder="Họ tên của bạn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={cx("input")}
          />
          <input
            type="email"
            placeholder="Nhập Email của bạn"
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
          <div
            style={{
              fontSize: "14px",
              display: "flex",
              gap: "5px",
              marginBottom: "50px",
              marginTop: "30px",
              justifyContent: "center",
            }}
          >
            <p style={{ textAlign: "center" }}>
              Bằng việc nhấn nút Đăng ký, bạn đã đồng ý với các
              <span style={{ color: "#2684fc", cursor: "pointer" }}>
                {" "}
                Quy định và Chính sách{" "}
              </span>
              của chúng tôi
            </p>
          </div>
          <button type="submit" className={cx("register-button")}>
            Đăng ký
          </button>
          <div className={cx("line")}></div>
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <p>Bạn đã có tài khoản?</p>
            <p
              style={{ color: "#2684FC", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Đăng nhập ngay
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
