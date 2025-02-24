import axios from "axios";

export const submitChatQuery = async (data) => {
    try {
        const response = await axios.post("http://localhost:9000/", data, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 20000  // Set timeout to 20 seconds
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Request timed out.");
        } else {
            console.error("API Error:", error);
        }
        return null;
    }
};

export const submitEvaluation = async (data) => {
    try {
        const response = await axios.post("http://localhost:9000/evaluation", data, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 20000  // Set timeout to 20 seconds
        });

        if (response.data && response.data.data) {
            console.log("Response:", response.data.data);
            return response.data;
        } else {
            console.error("Invalid API response structure:", response.data);
            return null;
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error("Request timed out.");
        } else {
            console.error("API Error:", error);
        }
        return null;
    }
};
