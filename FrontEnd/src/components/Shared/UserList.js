import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "../../services/authService";
import styles from "./UserList.module.scss";
import classNames from "classnames/bind";
import defaultAvt from '../../img/default.jpg';
const cx = classNames.bind(styles);

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);


  return (
    <div className={cx("user-list")}>
      {users.map((user) => (
        <div key={user._id} className={cx("user-item")}>
          <Link to={`/inbox/${user._id}`}>
            <div className={cx("user-avatar")}>
              <img src={user.profilePicture?`http://localhost:3001${user.profilePicture}`:defaultAvt} />
            </div>
            <div className={cx("user-name")}>{user.username}</div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default UserList;
