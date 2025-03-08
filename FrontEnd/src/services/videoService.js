import axios from "axios";

const API_URL= "http://localhost:3001/api/videos";

export const createVideo = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type" : "multipart/form-data",
            }
        });
        return response.data;
    } catch (error) {
        console.error("Create video failed", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const addComment = async (videoId, commentData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/${videoId}/comments`,
            commentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error ) {
        console.error("Error adding comment", error.response? error.response.data: error.message);
        throw error;
    }
}

export const getVideos = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching videos", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getVideoById = async (videoId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/${videoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching video with ID: ${videoId}`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.delete(`${API_URL}/${videoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch ( error) {
        console.error(`Error deleting video with ID: ${videoId}`, error.response ? error.response.data : error.message);
        throw error;
    }
};