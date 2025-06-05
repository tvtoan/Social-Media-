import React, { useCallback, useState } from "react";
import styles from "./Video.module.scss";
import classNames from "classnames/bind";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { addComment } from "../../services/videoService";
import { useNavigate } from "react-router-dom";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { BsFillSendFill } from "react-icons/bs";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);

const formatVideoDate = (dateString) => {
  const parsedDate = parseISO(dateString);
  return formatDistanceToNowStrict(parsedDate, { addSuffix: true });
};
const Video = ({ video }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(video.comments || []);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLikeClick = (e) => {
    setIsLiked(!isLiked);
  };
  const handleToggleComments = useCallback(() => {
    setShowComments((prev) => !prev);
  });

  const timeAgo = formatVideoDate(video.createdAt);

  const navigate = useNavigate();
  const handleAvatarClick = () => {
    navigate(`/profile/${video.userId._id}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newVideo = await addComment(video._id, { comment: commentText });
      setComments(newVideo.comments); //render comments list
      setCommentText("");
      setShowComments(true);
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  return (
    <div className={cx("video")}>
      <div className={cx("user-info")}>
        <img
          src={
            video.userId
              ? `https://social-media-7uo4.onrender.com${video.userId?.profilePicture}`
              : defaultAvt
          }
          alt="profile"
          className={cx("img")}
          onClick={video.userId ? handleAvatarClick : undefined}
        />
        <p>{video.userId?.username || "Unknown User"}</p>
      </div>
      <p className={cx("time-ago")}>{timeAgo}</p>
      <h3 className={cx("description")}>{video.description}</h3>
      <video controls className={cx("file-video")}>
        <source
          src={`https://social-media-7uo4.onrender.com/${video.videoPath}`}
          type="video/mp4"
        />
      </video>
      <div className={cx("video-actions")}>
        <div className={cx("item-actions")}>
          <AiOutlineLike
            className={cx("button-icon", { active: isLiked })}
            onClick={handleLikeClick}
          />
          <p>Likes</p>
        </div>
        <div className={cx("item-actions")} onClick={handleToggleComments}>
          <FaRegComment
            className={cx("button-icon", { active: showComments })}
          />
          <p>{comments.length} Comments</p>
        </div>
        <div className={cx("item-actions")}>
          <IoIosShareAlt className={cx("button-icon")} />
          <p>Share</p>
        </div>
      </div>
      <div className={cx("comments")}>
        {showComments && (
          <div>
            <h4 className={cx("comment-title")}> Comments</h4>
            <ul className={cx("comment-list")}>
              {Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => {
                  const commentTime = formatVideoDate(comment.createAt);
                  return (
                    <li key={comment._id} className={cx("comment-item")}>
                      <div className={cx("comment-details")}>
                        <img
                          src={
                            comment.userId
                              ? `https://social-media-7uo4.onrender.com${comment.userId?.profilePicture}`
                              : defaultAvt
                          }
                          alt="profile"
                          className={cx("img")}
                        />
                        <div className={cx("comment-user")}>
                          <strong className={cx("comment-username")}>
                            {comment.userId?.username || "Unknown User"}
                          </strong>
                          <p className={cx("time-comment")}>{commentTime}</p>
                          <p className={cx("comment-text")}>
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <p className={cx("no-comments")}>No Comments Available</p>
              )}
            </ul>
          </div> // Show comments when clicked
        )}
        {/* Form add comment */}
        <form onSubmit={handleCommentSubmit} className={cx("form-comment")}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className={cx("comment-input")}
          />
          <button
            type="submit"
            className={cx("button-submit")}
            onClick={handleCommentSubmit}
          >
            <BsFillSendFill className={cx("button-send")} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Video;
