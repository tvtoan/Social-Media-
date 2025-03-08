import React from "react";
import Comment from "./Comment";
import styles from "./CommentList.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const CommentList = ({ comments, postId, onCommentUpdated }) => {
  const rootComments = comments?.filter((comment) => !comment.parentId) || [];

  return (
    <div className={cx("comments")}>
      <h4 className={cx("comments-title")}>Comments:</h4>
      <ul className={cx("comments-list")}>
        {rootComments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            allComments={comments}
            postId={postId}
            onCommentUpdated={onCommentUpdated}
          />
        ))}
      </ul>
    </div>
  );
};

export default CommentList;
