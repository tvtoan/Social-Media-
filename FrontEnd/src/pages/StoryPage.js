import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteStory, getStoryById } from "../services/storyService";
import styles from "./Story.module.scss";
import classNames from "classnames/bind";
import { formatDistanceToNow, parseISO } from "date-fns";
import defaultAvt from "../img/default.jpg";
import { useAuth } from "../context/AuthContext";
import {RiCloseCircleFill} from 'react-icons/ri';
import {MdDelete} from 'react-icons/md';

const cx = classNames.bind(styles);

const formatStoryDate = (dateString) => {
  if (!dateString) return "";
  const parsedDate = parseISO(dateString); // parse string ISO to Date
  return formatDistanceToNow(parsedDate, { addSuffix: true }); // calc distance time and add 'ago'
};

const StoryPage = () => {
  const { id } = useParams();
  const {user, loading} = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState({});
  const [error, setError] = useState("");

  const timeAgo = formatStoryDate(story.createdAt);

  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/"); 
    }
  }, [user, loading, navigate]);

  const fetchStory = async () => {
    try {
      const data = await getStoryById(id);
      setStory(data);
    } catch (error) {
      console.error("Error fetching story details:", error);
      setError("Story not found");
    }
  };
  useEffect(() => {
    fetchStory();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteStory(id);
      navigate("/home");
    } catch (error) {
      console.error("Error deleting story", error);
      setError("Failed to delete the story");
      navigate("/home");
    }
  };
  if (error) {
    return <div className={cx("error")}>{error}</div>;
  }

  return (
    <div className={cx("story-page")}>
      {story && story.userId ? (
        <div className={cx("story-content")}>
          <div className={cx("user-info")}>
            <img
              src={
                story.userId?.profilePicture
                  ? `http://localhost:3001${story.userId.profilePicture}`
                  : defaultAvt
              }
              className={cx("img")}
            />
            <p>{story.userId.username}</p>
          </div>
          <p className={cx("time-ago")}>{timeAgo}</p>
          <button onClick={handleDelete} className={cx("delete-button")}>
            <MdDelete/>
          </button>
          <button
            className={cx("close-button")}
            onClick={() => navigate("/home")}
            aria-label="Close story"
          >
            <RiCloseCircleFill/>
          </button>

          {story.image && (
            <img
              src={`http://localhost:3001${story.image}`}
              alt="Story"
              className={cx("story-image")}
            />
          )}
          <p className={cx("text")}>{story.text}</p>
        </div>
      ) : (
        <p>Loading story...</p>
      )}
    </div>
  );
};

export default StoryPage;
