import React from "react";
import styles from "./Story.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import defaultAvt from '../../img/default.jpg';

const cx = classNames.bind(styles);

const Story = ({ story }) => {
 
  const navigate = useNavigate();

  const handleStoryClick = () => {
    navigate(`/story/${story._id}`);
  }
  return (
    <div className={cx("story")} onClick={handleStoryClick}>
      <img
        src={`http://localhost:3001${story.image}`}
        alt="story"
        className={cx("story-image")}
      />
      <div className={cx("story-info")}>
        <div className = {cx('user')}> 

          <div className={cx('avatar')}>

           <img
             src={story.userId?`http://localhost:3001${story.userId?.profilePicture}`: defaultAvt}
             className={cx('img')}
           /> 
          </div>
          <p className={cx("story-user")}>{story.userId?.username || "Unknown User"}</p>
        </div>

      </div>
    </div>
  );
};

export default Story;
