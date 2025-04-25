import React, { useRef, useState } from "react";
import { createPost } from "../../services/postService";
import styles from "./CreatePost.module.scss";
import classNames from "classnames/bind";
import defaultAvt from "../../img/default.jpg";
import { useAuth } from "../../context/AuthContext";
import { BsFillSendFill } from "react-icons/bs";
import { MdCloudUpload } from "react-icons/md";

const cx = classNames.bind(styles);

const CreatePost = ({ onPostCreated, userId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mood, setMood] = useState("neutral");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const moodOptions = [
    { value: "happy", label: "😊 Vui vẻ", color: "bg-yellow-200" },
    { value: "sad", label: "😢 Buồn", color: "bg-blue-200" },
    { value: "excited", label: "🤩 Hào hứng", color: "bg-green-200" },
    { value: "neutral", label: "😐 Bình thường", color: "bg-gray-200" },
  ];

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Nội dung không được để trống");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("mood", mood);
    formData.append("description", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const newPost = await createPost(formData);
      onPostCreated(newPost);
      setContent("");
      setImage(null);
      setPreview(null);
      setMood("neutral");
      setSuccess("Bài đăng đã được tạo!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Không thể tạo bài đăng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Bạn cần đăng nhập để đăng bài.</p>;
  }

  return (
    <form className={cx("form")} onSubmit={handleSubmit}>
      {error && <p className={cx("error")}>{error}</p>}
      {success && <p className={cx("success")}>{success}</p>}

      <div className={cx("form-user")}>
        <img
          src={
            user && user.profilePicture
              ? `http://localhost:3001${user.profilePicture}`
              : defaultAvt
          }
          alt="profile"
          className={cx("img")}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className={cx("description")}
          disabled={isLoading}
        ></textarea>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className={cx("form-input")}
        hidden
      />

      {preview && (
        <div className={cx("form-preview")}>
          <img src={preview} alt="Preview" className={cx("img-preview")} />
        </div>
      )}
      <div className={cx("mood-section")}>
        <label className={cx("mood-label")}>Tâm trạng của bạn</label>
        <div className={cx("mood-options")}>
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={cx("mood-button", option.color, {
                "mood-selected": mood === option.value,
              })}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className={cx("line")}></p>

      <div className={cx("form-button")}>
        <button
          type="button"
          onClick={handleFileClick}
          className={cx("custom-file-upload")}
          disabled={isLoading}
        >
          <MdCloudUpload className={cx("icon-upload")} />
        </button>
        <button type="submit" className={cx("form-post")} disabled={isLoading}>
          {isLoading ? (
            "Đang đăng..."
          ) : (
            <BsFillSendFill className={cx("icon-send")} />
          )}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
