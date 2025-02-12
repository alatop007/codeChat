import React from "react";
import InputSection from "./InputSection";
import FileExplorer from "./FileExplorer";
import ChatInterface from "./ChatInterface";
import { analyzeCode, queryCode } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface HomeProps {
  isProcessing?: boolean;
  onLocalPathSelect?: (path: string) => void;
  onGitHubUrlSubmit?: (url: string) => void;
  onSendMessage?: (message: string) => void;
}

const Home = () => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [codeContext, setCodeContext] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ready to help you analyze your code. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleLocalPathSelect = async (path: string) => {
    try {
      setIsProcessing(true);
      const file = new File([""], path);
      const result = await analyzeCode(file);
      setCodeContext(result.content);
      // Successfully processed the file
    } catch (error) {
      console.error("Error analyzing code:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      setIsProcessing(true);
      const result = await queryCode(message, codeContext);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date().toISOString(),
        },
      ]);
      // Successfully sent the message
    } catch (error) {
      console.error("Error querying code:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Input Section */}
      <InputSection
        onLocalPathSelect={handleLocalPathSelect}
        onGitHubUrlSubmit={(url) => console.log("GitHub URL:", url)}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <FileExplorer />

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            onSendMessage={handleSendMessage}
            isLoading={isProcessing}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium">Processing codebase...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
