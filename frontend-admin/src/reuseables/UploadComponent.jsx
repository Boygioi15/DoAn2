import { useEffect, useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CloudUpload,
  ImageIcon,
  TriangleAlert,
  Upload,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
export default function UploadComponent({
  maxSize = 10 * 1024 * 1024,
  accept = "image/*",
  className,
  onImageChange,
}) {
  const [coverImage, setCoverImage] = useState({
    id: null,
    file: null,
    preview: null,
  });

  const [imageLoading, setImageLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept,
    multiple: false,
    onFilesChange: (files) => {
      if (files.length > 0) {
        setImageLoading(true);
        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);
        setCoverImage(files[0]);
        onImageChange?.(files[0].file);

        simulateUpload();
      }
    },
  });

  const simulateUpload = () => {
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }

        const increment = Math.random() * 10 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setImageLoading(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    onImageChange?.(null);
  };

  const retryUpload = () => {
    if (coverImage) {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);
      simulateUpload();
    }
  };

  const hasImage = coverImage && coverImage.preview;

  return (
    <div className={cn("w-full h-full space-y-4", className)}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-[4px] transition-all duration-200 ",
          isDragging
            ? "border-dashed border-primary bg-primary/5"
            : hasImage
            ? "border-border bg-background hover:border-primary/50"
            : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />

        {hasImage ? (
          <>
            <div className="relative aspect-[3/4] w-full">
              {imageLoading && (
                <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="size-5" />
                    <span className="text-sm">Loading image...</span>
                  </div>
                </div>
              )}

              <img
                src={coverImage.preview}
                alt="Cover"
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />

              <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    onClick={openFileDialog}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Upload />
                    Đổi ảnh
                  </Button>
                  <Button
                    onClick={removeCoverImage}
                    variant="destructive"
                    size="sm"
                  >
                    <XIcon />
                    Xóa
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="relative">
                    <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-white/20"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 28 * (1 - uploadProgress / 100)
                        }`}
                        className="text-white transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center"
            onClick={openFileDialog}
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tải ảnh bìa lên</h3>
              <p className="text-sm text-muted-foreground">
                Kéo hoặc thả hình ảnh ở đây, hoặc nhấn để browse file
              </p>
              <p className="text-xs text-muted-foreground">
                Kích cỡ phù hợp: 225:300px
              </p>
            </div>

            <Button variant="outline" size="sm">
              <ImageIcon />
              Chọn file
            </Button>
          </div>
        )}
      </div>

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

      {uploadError && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>
              <p>{uploadError}</p>
              <Button onClick={retryUpload} variant="primary" size="sm">
                Retry Upload
              </Button>
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
