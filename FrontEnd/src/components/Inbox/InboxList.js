import React, { useEffect, useRef, useState } from "react";
import { createMessage, getMessages } from "../../services/inboxService";

import Message from "./Message";
import styles from "./InboxList.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const InboxList = ({ receiverId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const data = await getMessages(receiverId);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages: ", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !receiverId) return;

    try {
      // send message to receiver
      const sendMessage = await createMessage(receiverId, newMessage);

      const messageWithSender = {
        ...sendMessage,
        senderId: currentUser,
      }

      // update list message after send message
      setMessages((prevMessages) => [...prevMessages, messageWithSender]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message", error);
      alert("Failed to send message. Please try again later.");
    }
  };

  const handleKeyPress = (e) => {
    if(e.key === "Enter") {
      handleSendMessage();
    }
  }

  useEffect(() => {
    if (receiverId) fetchMessages(); // get messages from receiver
  }, [receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth", block: "end"})
  }, [messages])

  return (
    <div className={cx("inbox-list")}>
      <div className={cx("message")}>
        {messages.length === 0 ? (
          <p>No message available</p>
        ) : (
          <ul>
            {messages.map((message) => (
              <li key = {message._id}  >
                <Message
                  key={message._id}
                  message={message}
                  isCurrentUser={message.senderId._id === currentUser._id}
                />
                <div ref={messagesEndRef}/>
              </li >
              
            ))}
          </ul>
        )}
      </div>

      <div className={cx("message-input")}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className={cx("input")}
          onKeyDown={handleKeyPress}
        />

        <button  onClick={handleSendMessage} className={cx("send-button")}>
          Send
        </button>
      </div>
      
    </div>
  );
};

export default InboxList;
