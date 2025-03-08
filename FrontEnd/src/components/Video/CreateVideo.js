import React, { useRef, useState } from "react";
import styles from "./CreateVideo.module.scss";
import classNames from "classnames/bind";
import { createVideo } from "../../services/videoService";
import {PiUploadSimple} from 'react-icons/pi';
import { useAuth } from "../../context/AuthContext";
import defaultAvt from '../../img/default.jpg';


const cx = classNames.bind(styles);

const CreateVideo = ({ onVideoCreated, userId }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);
      console.log(videoUrl);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description cannot be empty");
      return;
    }

    if (!video) {
      setError("Please upload a video");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", description);
    formData.append("video", video);

    try {
      const newVideo = await createVideo(formData);
      onVideoCreated(newVideo);
      setDescription("");
      setVideo(null);
      setPreview("");
      setError("");
    } catch (error) {
      console.error("Error creating video", error);
    }
  };

  return (
    <form className={cx("form")}>
      {error && <p className={cx("error")}>{error}</p>}

      <div className={cx("form-user")}>
        <img
          src={
            user && user.profilePicture
              ? `http://localhost:3001${user.profilePicture}`
              : defaultAvt
          }
          className={cx("img")}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a description"
          className={cx("description")}
        ></textarea>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/"
        onChange={handleVideoChange}
        className={cx("form-input")}
      />
      {preview && (
        <video controls className={cx("form-preview")}>
          <source src={preview} type="video/mp4" />
          Your browser does not support the video tag
        </video>
      )}
      <p className={cx("line")}></p>
      <div className={cx("form-button")}>
        <button
          type="button"
          onClick={handleFileClick}
          className={cx("custom-file-upload")}
        >
          <PiUploadSimple />
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className={cx("form-post")}
        >
          Post Video
        </button>
      </div>
    </form>
  );
};

export default CreateVideo;
