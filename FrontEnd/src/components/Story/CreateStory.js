import React, { useRef, useState } from "react";
import { createStory } from "../../services/storyService";
import styles from "./CreateStory.module.scss";
import classNames from "classnames/bind";
import {PiUploadSimple} from 'react-icons/pi';

const cx = classNames.bind(styles);

const CreateStory = ({ onStoryCreated, userId }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null); // Create a ref for the input file

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file); // Lưu file vào state

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl); // Tạo preview ảnh
      console.log(previewUrl); // Log preview URL ra console
    } else {
      setPreview(null);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click(); // Trigger click on the hidden input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Text cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("text", text);

    if (image) {
      formData.append("image", image); // add file img
    }

    console.log(formData);
    try {
      const newStory = await createStory(formData);

      onStoryCreated(newStory);
      setText("");
      setImage(null);
      setPreview(null);
      setError("");
    } catch (error) {
      console.error("Error creating story", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cx("form")}>
      {error && <p className={cx("error")}>{error}</p>}

      {/* Click vào Icons.Upload sẽ trigger file input */}
      <button
        type="button"
        onClick={handleFileClick}
        className={cx("custom-file-upload")}
      >
        <PiUploadSimple />
      </button>
      {preview && (
        <img src={preview} alt="Preview" className={cx("form-preview")} />
      )}
      <div className={cx("form-user")}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Story text"
          className={cx("form-text")}
        />
      </div>
      {/* Input file ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleImageChange}
        className={cx("form-input")}
      />

      <button type="submit" className={cx("form-button")}>
        Post Story
      </button>
    </form>
  );
};

export default CreateStory;
