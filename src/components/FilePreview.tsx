import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

interface FilePreviewProps {
  fileName?: string;
  content?: string;
  language?: string;
}

const FilePreview = ({
  fileName = "example.tsx",
  content = "// Example code\nconst HelloWorld = () => {\n  return <div>Hello World</div>;\n};",
  language = "typescript",
}: FilePreviewProps) => {
  return (
    <Card className="w-full h-[200px] bg-background border rounded-md overflow-hidden">
      <div className="p-2 border-b bg-muted/50">
        <h3 className="text-sm font-mono text-foreground/70">{fileName}</h3>
      </div>
      <ScrollArea className="h-[calc(200px-2.5rem)] w-full">
        <pre className="p-4 text-sm font-mono">
          <code className="text-foreground/90">{content}</code>
        </pre>
      </ScrollArea>
    </Card>
  );
};

export default FilePreview;
