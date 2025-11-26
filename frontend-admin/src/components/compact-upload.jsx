import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { FileIcon, PlusIcon, TriangleAlert, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileUploadCompact({
  maxFiles = 3,
  maxSize = 10 * 1024 * 1024, // 2MB
  accept = "image/*",
  multiple = true,
  className,
  onFilesChange,
}) {
  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    onFilesChange,
  });

  const isImage = (file) => {
    const type = file instanceof File ? file.type : file.type;
    return type.startsWith("image/");
  };

  return (
    <div className={cn("w-full max-w-full", className)}>
      {/* Compact Upload Area */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border border-dashed p-2 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />

        {/* Upload Button */}
        <Button
          onClick={openFileDialog}
          variant={"outline"}
          className={cn(isDragging && "animate-bounce")}
          id={"compact-upload-button"}
        >
          <PlusIcon className="h-10 w-10" />
        </Button>

        {/* File Previews */}
        <div className="flex flex-1 items-center gap-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Thả ảnh ở đây hoặc nhấp để chọn (Tối đa: {maxFiles} ảnh)
            </p>
          ) : (
            files.map((fileItem) => (
              <div key={fileItem.id} className="group shrink-0">
                <div className="relative">
                  {isImage(fileItem.file) && fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-10 w-10 rounded-lg border object-cover"
                      title={`${fileItem.file.name} (${formatBytes(
                        fileItem.file.size
                      )})`}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted"
                      title={`${fileItem.file.name} (${formatBytes(
                        fileItem.file.size
                      )})`}
                    >
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => removeFile(fileItem.id)}
                    variant="destructive"
                    size="icon"
                    className="size-5 border-2 border-background absolute -right-2 -top-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <XIcon className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* File Count */}
        {files.length > 0 && (
          <div className="shrink-0 text-xs text-muted-foreground">
            {files.length}/{maxFiles}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
