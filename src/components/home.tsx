import React from "react";
import InputSection from "./InputSection";
import FileExplorer from "./FileExplorer";
import ChatInterface from "./ChatInterface";

interface HomeProps {
  isProcessing?: boolean;
  onLocalPathSelect?: (path: string) => void;
  onGitHubUrlSubmit?: (url: string) => void;
  onSendMessage?: (message: string) => void;
}

const Home = ({
  isProcessing = false,
  onLocalPathSelect = () => {},
  onGitHubUrlSubmit = () => {},
  onSendMessage = () => {},
}: HomeProps) => {
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Input Section */}
      <InputSection
        onLocalPathSelect={onLocalPathSelect}
        onGitHubUrlSubmit={onGitHubUrlSubmit}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <FileExplorer />

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            onSendMessage={onSendMessage}
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
