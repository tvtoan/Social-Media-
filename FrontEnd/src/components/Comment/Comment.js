"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { addComment, deleteComment } from "../../services/commentService";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import styles from "./Comment.module.scss";
import classNames from "classnames/bind";
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

const Comment = ({
  comment,
  allComments,
  postId,
  onCommentUpdated,
  depth = 0,
}) => {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Make sure allComments is an array before filtering
  const replies = Array.isArray(allComments)
    ? allComments.filter((c) => c && c.parentId === comment._id)
    : [];

  const handleAddReply = useCallback(
    async (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;
      try {
        setIsReplying(true);
        const newReply = await addComment(postId, {
          comment: replyText,
          parentId: comment._id,
        });

        // Make sure newReply has all required fields
        const replyWithUser = {
          ...newReply,
          userId: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };

        // Make sure we're adding to an array
        const updatedComments = Array.isArray(allComments)
          ? [replyWithUser, ...allComments]
          : [replyWithUser];

        onCommentUpdated(updatedComments);
        setReplyText("");
        setShowReplyForm(false);
      } catch (error) {
        console.error("Failed to add reply", error);
      } finally {
        setIsReplying(false);
      }
    },
    [replyText, postId, comment._id, onCommentUpdated, user, allComments]
  );

  const handleDeleteComment = useCallback(async () => {
    try {
      await deleteComment(comment._id);

      // Make sure we're filtering an array
      const updatedComments = Array.isArray(allComments)
        ? allComments.filter((c) => c && c._id !== comment._id)
        : [];

      onCommentUpdated(updatedComments);
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  }, [comment._id, onCommentUpdated, allComments]);

  // Guard against invalid comment data
  if (!comment) return null;

  return (
    <li
      className={cx("comment-item")}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className={cx("comment-content")}>
        <img
          src={
            comment.userId && comment.userId.profilePicture
              ? `https://social-media-7uo4.onrender.com${comment.userId.profilePicture}`
              : defaultAvt
          }
          alt={`${comment.userId?.username || "Unknown"}'s avatar`}
          className={cx("avatar")}
        />
        <div className={cx("comment-body")}>
          <h5 className={cx("username")}>
            {comment.userId?.username || "Unknown User"}
          </h5>
          <p className={cx("comment-text")}>{comment.comment}</p>
        </div>
        {user && comment.userId && user._id === comment.userId._id && (
          <button onClick={handleDeleteComment} className={cx("delete-button")}>
            <MdDelete />
          </button>
        )}
      </div>
      <div className={cx("comment-actions")}>
        <span className={cx("comment-time")}>
          {safeFormatDate(comment.createdAt)}
        </span>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className={cx("action-button")}
        >
          Reply
        </button>
      </div>
      {showReplyForm && (
        <form onSubmit={handleAddReply} className={cx("reply-form")}>
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className={cx("reply-input")}
            disabled={isReplying}
          />
          <button
            type="submit"
            className={cx("reply-submit")}
            disabled={isReplying}
          >
            {isReplying ? "Replying..." : "Reply"}
          </button>
        </form>
      )}
      {replies.length > 0 && (
        <ul className={cx("replies-list")}>
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              allComments={allComments}
              postId={postId}
              onCommentUpdated={onCommentUpdated}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default Comment;
