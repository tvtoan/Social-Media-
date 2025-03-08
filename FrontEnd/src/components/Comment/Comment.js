import React, { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { addComment, deleteComment } from "../../services/commentService";
import { MdDelete } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import styles from "./Comment.module.scss";
import classNames from "classnames/bind";
import defaultAvt from "../../img/default.jpg";

const cx = classNames.bind(styles);

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

  const replies = allComments.filter((c) => c.parentId === comment._id);

  console.log(comment);

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
        const replyWithUser = {
          ...newReply,
          userId: {
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };
        onCommentUpdated([replyWithUser, ...allComments]);
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
      onCommentUpdated(allComments.filter((c) => c._id !== comment._id));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  }, [comment._id, onCommentUpdated, allComments]);

  return (
    <li
      className={cx("comment-item")}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className={cx("comment-content")}>
        <img
          src={
            comment.userId
              ? `http://localhost:3001${comment.userId?.profilePicture}`
              : defaultAvt
          }
          alt={`${comment.userId?.username}'s avatar`}
          className={cx("avatar")}
        />
        <div className={cx("comment-body")}>
          <h5 className={cx("username")}>
            {comment.userId?.username || "Unknown User"}
          </h5>
          <p className={cx("comment-text")}>{comment.comment}</p>
        </div>
        {user && user._id === comment.userId?._id && (
          <button onClick={handleDeleteComment} className={cx("delete-button")}>
            <MdDelete />
          </button>
        )}
      </div>
      <div className={cx("comment-actions")}>
        <span className={cx("comment-time")}>
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
          })}
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
