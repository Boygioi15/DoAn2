import { useEffect, useState } from "react";
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
  maxFiles = 12,
  maxSize = 10 * 1024 * 1024, // 2MB
  accept = "image/*",
  multiple = true,
  className,
  onFilesChange,
  initialImageUrls = [], // 👈 1. Add this prop (Array of strings)
  onRemoveInitialImage, // 👈 2. Optional: Callback when user removes an old image
}) {
  // 3. Local state to manage existing URLs
  const [existingFiles, setExistingFiles] = useState([]);

  // 4. Sync initial URLs to local state on mount
  useEffect(() => {
    if (initialImageUrls && initialImageUrls.length > 0) {
      const formatted = initialImageUrls.map((url, index) => ({
        id: `existing-${index}`, // Unique ID for existing files
        preview: url,
        isExisting: true,
        file: {
          name: "Existing Image", // Placeholder name
          size: 0, // Size unknown for URLs
          type: "image/jpeg", // Assume image
        },
      }));
      setExistingFiles(formatted);
    }
  }, [initialImageUrls]);

  // 5. Calculate remaining slots for the hook
  const remainingSlots = Math.max(0, maxFiles - existingFiles.length);

  const [
    { files: newFiles, isDragging, errors }, // Renamed 'files' to 'newFiles'
    {
      removeFile: removeNewFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: remainingSlots, // 👈 Limit the hook based on existing files
    maxSize,
    accept,
    multiple,
    onFilesChange,
  });

  // 6. Handle removal of EITHER existing or new files
  const handleRemove = (fileItem) => {
    if (fileItem.isExisting) {
      // Remove from local state
      setExistingFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      // Notify parent (useful for backend deletion logic)
      if (onRemoveInitialImage) {
        onRemoveInitialImage(fileItem.preview);
      }
    } else {
      // Remove from hook state
      removeNewFile(fileItem.id);
    }
  };

  const isImage = (file) => {
    // If it's an existing file wrapper, check the mocked type or just return true
    if (!file) return false;
    const type = file.type || "";
    return type.startsWith("image/");
  };

  // 7. Merge lists for display
  const allFiles = [...existingFiles, ...newFiles];

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

        {/* Upload Button - Disable if max limit reached */}
        <Button
          onClick={openFileDialog}
          variant={"outline"}
          className={cn(isDragging && "animate-bounce")}
          id={"compact-upload-button"}
          disabled={allFiles.length >= maxFiles} // 👈 Disable button if full
        >
          <PlusIcon className="h-10 w-10" />
        </Button>

        {/* File Previews */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {allFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Thả ảnh ở đây (Tối đa: {maxFiles})
            </p>
          ) : (
            allFiles.map((fileItem) => (
              <div key={fileItem.id} className="group shrink-0 relative pt-2">
                <div className="relative">
                  {/* Image Preview */}
                  {(fileItem.isExisting || isImage(fileItem.file)) &&
                  fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-10 w-10 rounded-lg border object-cover"
                      title={
                        fileItem.isExisting
                          ? "Existing Image"
                          : `${fileItem.file.name} (${formatBytes(
                              fileItem.file.size
                            )})`
                      }
                    />
                  ) : (
                    /* Fallback Icon */
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted"
                      title={fileItem.file.name}
                    >
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => handleRemove(fileItem)} // 👈 Use our wrapper handler
                    variant="destructive"
                    size="icon"
                    className="size-5 border-2 border-background absolute -right-2 -top-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 z-10"
                  >
                    <XIcon className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* File Count */}
        {allFiles.length > 0 && (
          <div className="shrink-0 text-xs text-muted-foreground ml-2">
            {allFiles.length}/{maxFiles}
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
