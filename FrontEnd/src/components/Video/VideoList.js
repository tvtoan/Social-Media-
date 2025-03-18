import React, { useEffect, useState } from "react";
import Video from "./Video";
import CreateVideo from "./CreateVideo";
import { getVideos } from "../../services/videoService";

const VideoList = ({ userId }) => {
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
  };

  return (
    <div>
      <CreateVideo onVideoCreated={handleVideoCreated} userId={userId} />
      {videos.length === 0 ? (
        <p>No videos available</p>
      ) : (
        <ul>
          {videos.map((video) => (
            <li key={video._id} style={{ listStyle: "none" }}>
              <Video video={video} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideoList;
