import React from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

const ChatInterface = ({
  messages = [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ready to help you analyze your code. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ],
  onSendMessage = () => {},
  isLoading = false,
}: ChatInterfaceProps) => {
  return (
    <div className="flex flex-col h-full w-full bg-background border-l">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <MessageInput
        onSubmit={onSendMessage}
        isLoading={isLoading}
        placeholder="Ask a question about the codebase..."
      />
    </div>
  );
};

export default ChatInterface;
