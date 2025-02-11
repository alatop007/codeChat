import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Upload, Github } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface InputSectionProps {
  onLocalPathSelect?: (path: string) => void;
  onGitHubUrlSubmit?: (url: string) => void;
  isProcessing?: boolean;
}

const InputSection = ({
  onLocalPathSelect = () => {},
  onGitHubUrlSubmit = () => {},
  isProcessing = false,
}: InputSectionProps) => {
  const [githubUrl, setGithubUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = e.dataTransfer.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) {
            onLocalPathSelect(file.path);
          }
        }
      }
    }
  };

  const handleGitHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      onGitHubUrlSubmit(githubUrl);
    }
  };

  return (
    <div className="w-full p-6 space-y-6 bg-background border-b">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Directory Input */}
        <Card
          className="p-6 space-y-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h3 className="text-lg font-semibold">Local Directory</h3>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              webkitdirectory="true"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onLocalPathSelect(e.target.files[0].path);
                }
              }}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="h-6 w-6 mr-2" />
                    Drag & Drop or Click to Select
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select a local directory to analyze</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Card>

        {/* GitHub URL Input */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">GitHub Repository</h3>
          <form onSubmit={handleGitHubSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isProcessing}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!githubUrl.trim() || isProcessing}
            >
              <Github className="h-4 w-4 mr-2" />
              Analyze Repository
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default InputSection;
