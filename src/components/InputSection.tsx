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
  onAnalyze?: (input: { type: "path" | "url"; value: string }) => void;
  isProcessing?: boolean;
}

const InputSection = ({
  onAnalyze = () => {},
  isProcessing = false,
}: InputSectionProps) => {
  const [githubUrl, setGithubUrl] = React.useState("");
  const [localDirPath, setLocalDirPath] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = e.dataTransfer.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          try {
            // @ts-ignore - showDirectoryPicker is not yet in TypeScript types
            const dirHandle = await window.showDirectoryPicker();
            const dirPath = dirHandle.name;
            console.log("Selected directory:", dirPath);
            setLocalDirPath(dirPath);
            onAnalyze({ type: "path", value: dirPath });
          } catch (err) {
            console.error("Error accessing directory:", err);
            alert(
              "Unable to access directory. Please make sure you've granted permission.",
            );
          }
          break;
        }
      }
    }
  };

  const handleGitHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      onAnalyze({ type: "url", value: githubUrl.trim() });
      setGithubUrl("");
    }
  };

  const handleLocalDirSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localDirPath.trim()) {
      try {
        onAnalyze({
          type: "path",
          value: localDirPath.trim(),
        });
      } catch (err) {
        console.error("Error analyzing directory:", err);
        alert("Error analyzing directory. Please try again.");
      }
    }
  };

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is not yet in TypeScript types
      const dirHandle = await window.showDirectoryPicker({
        startIn: "desktop",
      });
      const dirPath = dirHandle.name;
      console.log("Selected directory:", dirPath);
      setLocalDirPath(dirPath);
    } catch (err) {
      console.error("Error accessing directory:", err);
      alert(
        "Unable to access directory. Please make sure you've granted permission.",
      );
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
          <form onSubmit={handleLocalDirSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter directory path or select below"
              value={localDirPath}
              onChange={(e) => setLocalDirPath(e.target.value)}
              disabled={isProcessing}
            />
            <div className="grid grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-dashed"
                      onClick={handleDirectorySelect}
                      disabled={isProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Directory
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a local directory to analyze</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="submit"
                className="w-full"
                disabled={!localDirPath.trim() || isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Analyze Directory
              </Button>
            </div>
          </form>
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
