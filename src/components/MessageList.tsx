import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({
  messages = [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ready to help you analyze your code. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      role: "user",
      content: "Can you explain the main functionality of this codebase?",
      timestamp: new Date().toISOString(),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "This appears to be a React application that provides code analysis capabilities. The main components include file exploration, chat interface, and code preview features.",
      timestamp: new Date().toISOString(),
    },
  ],
}: MessageListProps) => {
  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full px-4">
        <div className="flex flex-col space-y-4 py-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`flex items-start space-x-4 p-4 ${message.role === "assistant" ? "bg-secondary/50" : "bg-background"}`}
            >
              <Avatar
                className={`h-8 w-8 ${message.role === "assistant" ? "bg-primary" : "bg-muted"}`}
              >
                <span className="text-xs">
                  {message.role === "assistant" ? "AI" : "You"}
                </span>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {message.role === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
