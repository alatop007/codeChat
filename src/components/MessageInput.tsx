import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const MessageInput = ({
  onSubmit = () => {},
  isLoading = false,
  placeholder = "Ask a question about the codebase...",
}: MessageInputProps) => {
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-[100px] bg-background border-t border-border p-4 flex gap-4 items-end"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 resize-none h-[60px]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="h-[40px] w-[100px]"
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-background border-t-foreground rounded-full animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send
          </>
        )}
      </Button>
    </form>
  );
};

export default MessageInput;
