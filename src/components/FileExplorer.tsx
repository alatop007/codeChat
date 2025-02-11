import React from "react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronRight, ChevronDown, FileIcon, FolderIcon } from "lucide-react";
import FilePreview from "./FilePreview";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

interface FileExplorerProps {
  files?: FileNode[];
  onFileSelect?: (file: FileNode) => void;
}

const FileExplorer = ({
  files = [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "components",
          type: "folder",
          children: [
            {
              name: "App.tsx",
              type: "file",
              content:
                "// Example content\nexport default function App() {\n  return <div>Hello World</div>\n}",
            },
            {
              name: "Button.tsx",
              type: "file",
              content:
                "// Button component\nexport const Button = () => {\n  return <button>Click me</button>\n}",
            },
          ],
        },
        {
          name: "utils",
          type: "folder",
          children: [
            {
              name: "helpers.ts",
              type: "file",
              content: "export const sum = (a: number, b: number) => a + b;",
            },
          ],
        },
      ],
    },
  ],
  onFileSelect = () => {},
}: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = React.useState<FileNode | null>(null);

  const FileTree = ({
    node,
    depth = 0,
  }: {
    node: FileNode;
    depth?: number;
  }) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleFileClick = (file: FileNode) => {
      setSelectedFile(file);
      onFileSelect(file);
    };

    return (
      <div className="w-full">
        {node.type === "folder" ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full flex items-center gap-2 p-2 hover:bg-accent/50 rounded-lg">
              <div
                style={{ marginLeft: `${depth * 12}px` }}
                className="flex items-center gap-2"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <FolderIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{node.name}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {node.children?.map((child, index) => (
                <FileTree key={index} node={child} depth={depth + 1} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <button
            className="w-full flex items-center gap-2 p-2 hover:bg-accent/50 rounded-lg"
            onClick={() => handleFileClick(node)}
          >
            <div
              style={{ marginLeft: `${(depth + 1) * 12}px` }}
              className="flex items-center gap-2"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{node.name}</span>
            </div>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-[300px] h-full flex flex-col bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Files</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.map((file, index) => (
            <FileTree key={index} node={file} />
          ))}
        </div>
      </ScrollArea>
      {selectedFile?.type === "file" && (
        <div className="h-[200px] border-t">
          <FilePreview
            fileName={selectedFile.name}
            content={selectedFile.content}
            language={selectedFile.name.split(".").pop() || ""}
          />
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
