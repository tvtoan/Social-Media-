import React, { useEffect, useId, useState } from "react";
import Video from "./Video";
import CreateVideo from "./CreateVideo";
import  { getVideos } from "../../services/videoService";
import styles from './VideoList.module.scss';
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const VideoList = ({userId}) => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data.reverse());
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

 

  const handleVideoCreated = (newVideo) => {
    setVideos((prevVideo) => [newVideo, ...prevVideo]);
    fetchVideos();
  }

  return (
    <div className = {cx('video-list')}> 
      <CreateVideo onVideoCreated = {handleVideoCreated} userId = {userId} />
      {videos.length === 0 ? (
        <p>No videos available</p>
      ) : (
        <ul>
          {videos.map((video) => (
            <li key={video._id}>
              <Video video={video} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideoList;
