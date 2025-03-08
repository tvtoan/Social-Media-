import React, { useState } from "react";
import { createPost } from "../../services/postService";
import styles from "./CreatePost.module.scss";
import classNames from "classnames/bind";
import defaultAvt from "../../img/default.jpg";
import { useAuth } from "../../context/AuthContext";

const cx = classNames.bind(styles);

const CreatePost = ({ onPostCreated, userId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", content);
    if (image) {
      formData.append("image", image);
    }
    try {
      const newPost = await createPost(formData);
      setContent("");
      setImage(null);
      setPreview(null);
      setError("");
      onPostCreated(newPost);
      console.log(newPost);
    } catch (error) {
      console.error("Error creating post", error);
      setError("Failed to create post. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cx("form")}>
      <div className={cx("form-user")}>
        <img
          src={`http://localhost:3001${user.profilePicture}` || defaultAvt}
          alt="User Avatar"
          className={cx("img")}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className={cx("form-text")}
        />
      </div>
      {error && <p className={cx("error")}>{error}</p>}
      <label className={cx("custom-file-upload")}>
        <input
          type="file"
          onChange={handleImageChange}
          className={cx("form-input")}
        />
        Upload file
      </label>
      {preview && (
        <img src={preview} alt="Preview" className={cx("form-preview")} />
      )}
      <button type="submit" className={cx("form-button")}>
        Post
      </button>
    </form>
  );
};

export default CreatePost;
