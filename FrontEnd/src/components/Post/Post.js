"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { deletePost } from "../../services/postService";
import { addComment } from "../../services/commentService";
import { useAuth } from "../../context/AuthContext";
import CommentList from "../Comment/CommentList";
import styles from "./Post.module.scss";
import classNames from "classnames/bind";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { RiSendPlaneLine } from "react-icons/ri";
import { FaDeleteLeft } from "react-icons/fa6";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);

// Helper function to safely format dates
const safeFormatDate = (dateString) => {
  if (!dateString) return "recently";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return "recently";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "recently";
  }
};

const Post = ({ post: initialPost, onPostUpdated }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const handleDeletePost = useCallback(async () => {
    try {
      await deletePost(post._id);
      // Pass a function to onPostUpdated that filters out the deleted post
      onPostUpdated((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  }, [post._id, onPostUpdated]);

  const handleAddComment = useCallback(
    async (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      try {
        setIsCommenting(true);
        const newComment = await addComment(post._id, { comment: commentText });
        const commentWithUser = {
          ...newComment,
          userId: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };

        // Create an updated post with the new comment
        const updatedPost = {
          ...post,
          comments: Array.isArray(post.comments)
            ? [commentWithUser, ...post.comments]
            : [commentWithUser],
        };

        // Update local state
        setPost(updatedPost);

        // Pass the updated post to the parent component
        onPostUpdated(updatedPost);

        setCommentText("");
      } catch (error) {
        console.error("Failed to add comment", error);
      } finally {
        setIsCommenting(false);
      }
    },
    [commentText, post, onPostUpdated, user]
  );

  const handleCommentUpdated = useCallback(
    (updatedComments) => {
      // Create an updated post with the updated comments
      const updatedPost = {
        ...post,
        comments: updatedComments,
      };

      // Update local state
      setPost(updatedPost);

      // Pass the updated post to the parent component
      onPostUpdated(updatedPost);
    },
    [post, onPostUpdated]
  );

  // Guard against invalid post data
  if (!post) return null;

  return (
    <div className={cx("post")}>
      <div className={cx("user-info")}>
        <img
          src={
            post.userId?.profilePicture
              ? `http://localhost:3001${post.userId.profilePicture}`
              : defaultAvt
          }
          alt={`${post.userId?.username || "Unknown"}'s avatar`}
          className={cx("img")}
        />
        <div>
          <h3 className={cx("username")}>
            {post.userId?.username || "Unknown User"}
          </h3>
          <p className={cx("post-time")}>{safeFormatDate(post.createdAt)}</p>
        </div>
        {user && post.userId && user._id === post.userId._id && (
          <button onClick={handleDeletePost} className={cx("delete-button")}>
            <FaDeleteLeft className={cx("delete-button")} />
          </button>
        )}
      </div>
      <p className={cx("description")}>{post.description}</p>
      {post.image && (
        <img
          src={`http://localhost:3001${post.image}`}
          alt="Post"
          className={cx("post-image")}
        />
      )}
      <div className={cx("post-actions")}>
        <div className={cx("item-actions")}>
          <AiOutlineLike
            className={cx("button-icon", { active: isLiked })}
            onClick={handleLikeClick}
          />
          <p>Likes</p>
        </div>
        <div className={cx("item-actions")}>
          <FaRegComment className={cx("button-icon")} />
          <p>
            Comments ({Array.isArray(post.comments) ? post.comments.length : 0})
          </p>
        </div>
        <div className={cx("item-actions")}>
          <IoIosShareAlt className={cx("button-icon")} />
          <p>Share</p>
        </div>
      </div>
      <CommentList
        comments={Array.isArray(post.comments) ? post.comments : []}
        postId={post._id}
        onCommentUpdated={handleCommentUpdated}
      />
      <form onSubmit={handleAddComment} className={cx("comment-form")}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className={cx("comment-input")}
          disabled={isCommenting}
        />
        <button
          type="submit"
          className={cx("comment-submit")}
          disabled={isCommenting}
        >
          <RiSendPlaneLine className={cx("send-button")} />
        </button>
      </form>
    </div>
  );
};

export default Post;
