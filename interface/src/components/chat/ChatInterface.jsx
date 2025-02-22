import React from "react";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    Avatar
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";


const ChatInterface = ({messages, setMessages, handleSend}) => {

    return (
        <MainContainer style={{height: "500px"}}>
            <ChatContainer>
                <MessageList>
                    {messages.map((msg, index) => (
                        <Message
                            key={index}
                            model={{
                                message: msg.text,
                                direction: msg.sender === "user" ? "outgoing" : "incoming",
                                sender: msg.sender === "user" ? "You" : "Bot"
                            }}
                        >
                            <Avatar
                                name={msg.sender === "user" ? "User" : "Bot"}
                                size="md"
                                src={msg.sender === "user"
                                    ? "https://cdn-icons-png.flaticon.com/512/4140/4140037.png"
                                    : "https://cdn-icons-png.flaticon.com/512/1587/1587565.png"}
                            />
                        </Message>
                    ))}
                </MessageList>
                <MessageInput
                    placeholder={messages.length === 0 ? "Load a conversation via JSON file." : "What can I help you with?"}
                    onSend={(msg) => handleSend(msg, setMessages)}
                    attachButton={false}
                    disabled={messages.length === 0}
                />
            </ChatContainer>
        </MainContainer>
    );
};

export default ChatInterface;
