import {submitChatQuery} from "../../services/api";

// Handles sending message + attachment
export const handleSend = async (userMessage, setMessages) => {
    if (!userMessage.trim()) return; // Prevent sending empty messages

    // Add user message to the chat
    setMessages(prevMessages => [
        ...prevMessages,
        { text: userMessage, sender: "user" }
    ]);

    try {
        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("message", userMessage);

        // Send message and file to backend
        const response = await submitChatQuery(formData);

        // Get bot/system response
        const systemMessage = response.data;

        // Update chat with bot response
        setMessages(prevMessages => [
            ...prevMessages,
            { text: systemMessage, sender: "bot" } // Change "system" to "bot"
        ]);

    } catch (error) {
        console.error("Error sending message:", error);

        // Show error message
        setMessages(prevMessages => [
            ...prevMessages,
            { text: "Something went wrong. Please try again later.", sender: "bot" }
        ]);
    }
};
