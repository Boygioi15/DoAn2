import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Upload,
  X,
  Search,
  Camera,
  Trash2,
  Crop,
  RotateCcw,
} from 'lucide-react';
import { productApi } from '@/api/productApi';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import Cropper from 'react-easy-crop';

// States: 'idle' | 'imageSelected' | 'cropping' | 'processing' | 'failed'
const STATE = {
  IDLE: 'idle',
  IMAGE_SELECTED: 'imageSelected',
  CROPPING: 'cropping',
  PROCESSING: 'processing',
  FAILED: 'failed',
};

// Helper function to create cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}

export function ImageSearchDialog({ open, onOpenChange, onSearchResults }) {
  const [state, setState] = useState(STATE.IDLE);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState('');
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (originalPreviewUrl && originalPreviewUrl !== previewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
      if (croppedPreviewUrl && croppedPreviewUrl !== previewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
      setSelectedImage(null);
      setPreviewUrl('');
      setOriginalPreviewUrl('');
      setCroppedPreviewUrl('');
      setState(STATE.IDLE);
      setIsDragging(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCroppedImage(null);
    }
  }, [open, previewUrl, originalPreviewUrl]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl.trim().length > 0 &&
        previewUrl !== originalPreviewUrl
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    (file) => {
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        setState(STATE.FAILED);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        setState(STATE.FAILED);
        return;
      }

      // Revoke old preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewUrl(newPreviewUrl);
      if (!originalPreviewUrl || originalPreviewUrl === '') {
        setOriginalPreviewUrl(newPreviewUrl);
      }
      setState(STATE.IMAGE_SELECTED);
    },
    [previewUrl]
  );

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

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    if (croppedPreviewUrl) {
      URL.revokeObjectURL(croppedPreviewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl('');
    setOriginalPreviewUrl('');
    setCroppedPreviewUrl('');
    setState(STATE.IDLE);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleStartCrop = () => {
    // If we already have a cropped image, use the original for cropping
    if (originalPreviewUrl) {
      setPreviewUrl(originalPreviewUrl);
    }
    setState(STATE.CROPPING);
  };

  const handleCancelCrop = () => {
    // If we have a cropped image, restore its preview
    if (croppedImage && croppedPreviewUrl) {
      setPreviewUrl(croppedPreviewUrl);
    }
    setState(STATE.IMAGE_SELECTED);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleRestoreOriginal = () => {
    if (originalPreviewUrl) {
      // Revoke the cropped preview URL
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
      setPreviewUrl(originalPreviewUrl);
      setCroppedPreviewUrl('');
      setCroppedImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      toast.success('Đã khôi phục ảnh gốc!');
    }
  };

  const handleApplyCrop = async () => {
    try {
      // Use original preview URL for cropping
      const sourceUrl = originalPreviewUrl || previewUrl;
      const croppedBlob = await getCroppedImg(sourceUrl, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], selectedImage.name, {
        type: 'image/jpeg',
      });

      // Revoke old cropped preview URL if it exists
      if (croppedPreviewUrl) {
        URL.revokeObjectURL(croppedPreviewUrl);
      }
      const newCroppedPreviewUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(newCroppedPreviewUrl);
      setCroppedPreviewUrl(newCroppedPreviewUrl);

      setCroppedImage(croppedFile);
      setState(STATE.IMAGE_SELECTED);
      toast.success('Đã cắt ảnh thành công!');
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Lỗi khi cắt ảnh');
    }
  };

  const handleSearch = async () => {
    if (!selectedImage && !croppedImage) {
      toast.error('Vui lòng chọn hình ảnh');
      return;
    }

    setState(STATE.PROCESSING);

    try {
      // Use cropped image if available, otherwise use original
      const imageToSearch = croppedImage || selectedImage;
      const response = await productApi.searchByImage(imageToSearch);

      if (response.data) {
        toast.success('Đã tìm kiếm thành công!');
        console.log(previewUrl);
        // console.log('SIU: ');
        // console.log(searchImageUrl);
        onSearchResults?.(response.data, imageToSearch);
        onOpenChange(false);
      } else {
        toast.warning('Không tìm thấy sản phẩm phù hợp');
        setState(STATE.IMAGE_SELECTED);
      }
    } catch (error) {
      console.error('Error searching by image:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error('Lỗi khi tìm kiếm ảnh: ' + errorMessage);
      setState(STATE.FAILED);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
                w-full h-56 border-2 border-dashed rounded-xl
                flex flex-col items-center justify-center gap-4 cursor-pointer
                transition-all duration-300
                ${
                  state === STATE.FAILED ? 'border-orange-500 bg-orange-50' : ''
                }
                ${
                  isDragging
                    ? 'scale-[1.02] border-blue-500 bg-blue-50'
                    : state !== STATE.FAILED
                    ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    : ''
                }
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={state === STATE.FAILED ? '' : 'animate-bounce'}>
                {state === STATE.FAILED ? (
                  <X className="w-16 h-16 text-orange-500" />
                ) : (
                  <Upload
                    className={`w-16 h-16 ${
                      isDragging ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-lg font-medium ${
                    state === STATE.FAILED
                      ? 'text-orange-600'
                      : isDragging
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {state === STATE.FAILED
                    ? 'Có lỗi xảy ra, thử lại'
                    : isDragging
                    ? 'Thả hình ảnh tại đây'
                    : 'Kéo thả hoặc nhấn để chọn'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {state === STATE.CROPPING ? (
                <div className="relative w-full h-100 rounded-xl overflow-hidden bg-gray-900">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 4}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              ) : (
                <div
                  className={`group relative w-full h-100 rounded-xl overflow-hidden ${
                    state === STATE.PROCESSING
                      ? 'bg-blue-100'
                      : state === STATE.FAILED
                      ? 'bg-orange-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={`w-full h-full object-contain transition-transform duration-300 ${
                      state === STATE.PROCESSING
                        ? 'opacity-50'
                        : 'group-hover:scale-[1.02]'
                    }`}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-90 hover:opacity-100"
                    onClick={handleClear}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {state === STATE.CROPPING && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700">
                    Zoom
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full mt-1"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 text-center mt-2 truncate px-4">
                {selectedImage?.name}
                {croppedImage && ' (đã cắt)'}
              </p>
            </div>
          )}

          {/* Status Text */}
          <div className="text-center">
            {state === STATE.PROCESSING && (
              <p className="text-lg font-medium text-blue-600 flex items-center gap-2">
                <Spinner /> Đang phân tích hình ảnh...
              </p>
            )}
            {state === STATE.FAILED && (
              <p className="text-lg font-medium text-red-600">
                ❌ Tìm kiếm thất bại
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap justify-center w-full">
            {(state === STATE.IDLE ||
              (state === STATE.FAILED && !previewUrl)) && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-blue-600"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Chọn hình ảnh
              </Button>
            )}

            {state === STATE.CROPPING && (
              <>
                <Button onClick={handleCancelCrop} size="lg" variant="outline">
                  <X className="w-5 h-5 mr-2" />
                  Hủy
                </Button>
                <Button
                  onClick={handleApplyCrop}
                  size="lg"
                  className="bg-green-600 hover:bg-green-600/90"
                >
                  <Crop className="w-5 h-5 mr-2" />
                  Áp dụng
                </Button>
              </>
            )}

            {(state === STATE.IMAGE_SELECTED ||
              (state === STATE.FAILED && previewUrl)) && (
              <>
                <Button onClick={handleClear} size="lg" variant="outline">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Chọn ảnh khác
                </Button>
                {croppedImage && (
                  <Button
                    onClick={handleRestoreOriginal}
                    size="lg"
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="w-5 h-5 mr-1" />
                    Khôi phục
                  </Button>
                )}
                <Button
                  onClick={handleStartCrop}
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Crop className="w-5 h-5 mr-1" />
                  {croppedImage ? 'Cắt lại' : 'Cắt ảnh'}
                </Button>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-600/90"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {state === STATE.FAILED ? 'Thử lại' : 'Tìm kiếm'}
                </Button>
              </>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 text-center max-w-[380px]">
            Tải lên hình ảnh sản phẩm để tìm kiếm các sản phẩm tương tự trong
            cửa hàng
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
