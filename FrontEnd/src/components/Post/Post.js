import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { deletePost, likePost, unLikePost } from "../../services/postService";
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

const safeFormatDate = (dateString) => {
  if (!dateString) return "recently";
  try {
    const date = new Date(dateString);
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
  const [likeCount, setLikeCount] = useState(initialPost.likes?.length || 0);

  useEffect(() => {
    if (user && post.likes) {
      setIsLiked(post.likes.includes(user._id));
      setLikeCount(post.likes.length);
    }
  }, [user, post.likes]);

  const handleLikeClick = useCallback(async () => {
    try {
      if (isLiked) {
        const response = await unLikePost(post._id);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        setPost(response.post);
        onPostUpdated(response.post);
      } else {
        const response = await likePost(post._id);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        setPost(response.post);
        onPostUpdated(response.post);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  }, [isLiked, post._id, onPostUpdated]);

  const handleDeletePost = useCallback(async () => {
    try {
      await deletePost(post._id);
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
        const updatedPost = {
          ...post,
          comments: Array.isArray(post.comments)
            ? [commentWithUser, ...post.comments]
            : [commentWithUser],
        };
        setPost(updatedPost);
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
      const updatedPost = { ...post, comments: updatedComments };
      setPost(updatedPost);
      onPostUpdated(updatedPost);
    },
    [post, onPostUpdated]
  );

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
          <button onClick={handleDeletePost}>
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
          <p>{likeCount} Likes</p>
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
