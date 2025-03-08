import React, { useEffect, useState } from "react";
import styles from "./Message.module.scss";
import classNames from "classnames/bind";
import { formatDistanceToNow } from "date-fns";
const cx = classNames.bind(styles);

const Message = ({ message, isCurrentUser }) => {
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    if (showTime) {
      const timer = setTimeout(() => setShowTime(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTime]);

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cx("message", {
        sent: isCurrentUser,
        received: !isCurrentUser,
      })}
      onClick={() => setShowTime(!showTime)}
    >
      <div className={cx("message-box")}>
        <p className={cx("message-text")}>{message.text}</p>
        <img
          src={`http://localhost:3001${message.senderId?.profilePicture}`}
          className={cx("img")}
        />
        {showTime && (
          <div className={cx("message-time")}>
            <p>Sent: {timeAgo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
