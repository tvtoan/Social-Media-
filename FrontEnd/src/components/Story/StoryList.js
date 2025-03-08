import React, { useEffect, useState } from "react";
import { getStories } from "../../services/storyService";
import Story from "./Story";
import styles from "./StoryList.module.scss";
import classNames from "classnames/bind";
import CreateStory from "./CreateStory";

const cx = classNames.bind(styles);

const StoryList = ({userId}) => {
  const [stories, setStories] = useState([]);

  const fetchStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories: ", error);
    }
  };

  useEffect(() => { 
    fetchStories();
  }, []);


  const handleStoryCreated = (newStory) => {
    setStories((prevStory) => [newStory, ...prevStory]);
    fetchStories();
  };

  return (
    <div className={cx("story")}>
      <CreateStory onStoryCreated={handleStoryCreated} userId={userId} />
      
      {stories.length === 0 ? (
        <p>No Stories available</p>
      ) : (
        <ul className={cx('story-list')}>
          {stories.map((story) => (
            <li key={story._id} className={cx("story-item")}>
              <Story story={story} />
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StoryList;
