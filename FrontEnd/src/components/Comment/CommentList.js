import Comment from "./Comment";
import styles from "./CommentList.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const CommentList = ({ comments, postId, onCommentUpdated }) => {
  // Make sure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : [];

  // Filter out any undefined or null comments
  const validComments = safeComments.filter((comment) => comment);

  // Get root comments (those without a parentId)
  const rootComments = validComments.filter((comment) => !comment.parentId);

  return (
    <div className={cx("comments")}>
      <h4 className={cx("comments-title")}>Comments:</h4>
      {rootComments.length > 0 ? (
        <ul className={cx("comments-list")}>
          {rootComments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              allComments={validComments}
              postId={postId}
              onCommentUpdated={onCommentUpdated}
            />
          ))}
        </ul>
      ) : (
        <p className={cx("no-comments")}>
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};

export default CommentList;
