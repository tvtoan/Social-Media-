import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./InboxPage.module.scss";
import classNames from "classnames/bind";
import InboxList from "../components/Inbox/InboxList";
import UserList from "../components/Shared/UserList";
import Layout from "../../src/components/Layout/Layout";
import { getUserById } from "../services/authService";

import defaultAvt from "../img/default.jpg";

const cx = classNames.bind(styles);

const InboxPage = () => {
  const { receiverId } = useParams();
  const { user, loading } = useAuth();
  const [receiver, setReceiver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const fetchReceiverData = useCallback(async () => {
    if (!receiverId || receiverId === ":id") return;
    try {
      const receiverData = await getUserById(receiverId);
      setReceiver(receiverData);
    } catch (error) {
      console.error("Error fetching receiver data", error);
    }
  }, [receiverId]);
  useEffect(() => {
    if (receiverId) {
      fetchReceiverData();
    }
  }, [receiverId, fetchReceiverData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div> Please login to view your inbox</div>;
  }

  const handleAvatarClick = () => {
    navigate(`/profile/${receiverId}`);
  };

  return (
    <Layout>
      <div className={cx("inbox-page")}>
        <div className={cx("user-list")}>
          <UserList />
        </div>
        <div className={cx("message-section")}>
          {receiverId && receiver ? (
            <>
              <div className={cx("receiver-info")} onClick={handleAvatarClick}>
                <img
                  src={
                    receiver.profilePicture
                      ? `https://social-media-7uo4.onrender.com${receiver.profilePicture}`
                      : defaultAvt
                  }
                  alt="avt"
                  onClick={handleAvatarClick}
                />
                <p>{receiver.username}</p>
              </div>
              <div className={cx("chat-area")}>
                <InboxList receiverId={receiverId} currentUser={user} />
              </div>
            </>
          ) : (
            <p
              style={{ color: "white", fontWeight: "bold", fontSize: "1.5rem" }}
            >
              Select a user to start chatting
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InboxPage;
