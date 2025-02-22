import axios from "axios";

export const submitChatQuery = async (data) => {
    try {
        const response = await axios.post("http://localhost:9000/", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;

    } catch (error) {
        console.error("API Error:", error);
    }
};


export const submitEvaluation = async (data) => {
    try {
        const response = await axios.post("http://localhost:9000/evaluation", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (response.data && response.data.data) {
            console.log("Response:", response.data.data);
            return response.data;

        } else {
            console.error("Invalid API response structure:", response.data);
            return null;
        }
    }
    catch (error) {
        console.error("API Error:", error);
    }

}
