import axios from "axios";

const API_URL = "http://localhost:3001/api/inbox"

export const createMessage = async (receiverId, messageText) => {
    try {
       
        const token = localStorage.getItem ('token')
        const messageData = {receiverId, text: messageText}
        const response = await axios.post(`${API_URL}`, messageData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json" 
            }
        });
        return response.data;
    } catch (error) {
        console.error("Create message failed", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getMessages = async (receiverId) => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/${receiverId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching message ", error.response ? error.response.data : error.message);
        throw error;
    }
};


