import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image, Upload, X, Search, Camera, Trash2 } from 'lucide-react';
import './ImageSearchDialog.css';
import { imageApi } from '@/api/imageApi';
import { toast } from 'sonner';

export function ImageSearchDialog({ open, onOpenChange, onSearchResults }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setPreviewUrl('');
      setIsProcessing(false);
      setIsDragging(false);
    }
  }, [open]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Revoke old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error('Vui lòng chọn hình ảnh');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert to base64
      const base64Image = await fileToBase64(selectedImage);

      // Send to backend
      const response = await imageApi.searchByImage({
        imageData: base64Image,
        mimeType: selectedImage.type,
      });

      if (response.data) {
        toast.success('Đã tìm kiếm thành công!');
        onSearchResults?.(response.data);
        onOpenChange(false);
      } else {
        toast.warning('Không tìm thấy sản phẩm phù hợp');
      }
    } catch (error) {
      console.error('Error searching by image:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <Camera className="w-6 h-6" />
            Tìm kiếm bằng hình ảnh
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Drop Zone / Preview */}
          {!previewUrl ? (
            <div
              className={`
                image-search-drop-zone w-full h-56 border-2 border-dashed rounded-xl
                flex flex-col items-center justify-center gap-4 cursor-pointer
                transition-all duration-300
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
              `}
              onClick={handleClickUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`image-search-bounce ${isDragging ? '' : ''}`}>
                <Upload 
                  className={`w-16 h-16 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
                />
              </div>
              <div className="text-center">
                <p className={`text-lg font-medium ${isDragging ? 'text-blue-600' : 'text-gray-600'}`}>
                  {isDragging ? 'Thả hình ảnh tại đây' : 'Kéo thả hoặc nhấn để chọn'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="image-preview-container relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="image-preview-overlay" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-90 hover:opacity-100"
                  onClick={handleClear}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2 truncate px-4">
                {selectedImage?.name}
              </p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent" />
              <p className="text-blue-600 font-medium">Đang phân tích hình ảnh...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap justify-center w-full">
            {!previewUrl ? (
              <Button
                onClick={handleClickUpload}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Image className="w-5 h-5 mr-2" />
                Chọn hình ảnh
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleClear}
                  size="lg"
                  variant="outline"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Chọn ảnh khác
                </Button>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  disabled={isProcessing}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 text-center max-w-[380px]">
            Tải lên hình ảnh sản phẩm để tìm kiếm các sản phẩm tương tự trong cửa hàng
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

