import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import BriefProductCard from '@/reusable_components/BriefProductCard';
import { ImageSearchDialog } from '@/reusable_components/ImageSearchDialog';
import SpinnerOverlay from '@/reusable_components/SpinnerOverlay';
import { buildQueryStringFromObject } from '@/util';
import { ChevronUp, ImageIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SearchByImagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { productList: initialProductList, searchImage: initialSearchImage } =
    location.state || {};

  const [productList, setProductList] = useState(initialProductList);
  const [searchImage, setSearchImage] = useState(initialSearchImage);
  const previewUrl = useMemo(() => {
    if (!searchImage) return null;
    // console.log('SI: ', searchImage);
    return URL.createObjectURL(searchImage);
  }, [searchImage]);

  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const [size, setSize] = useState(10);
  const [threshold, setThreshold] = useState('medium');

  const [isLoading, setIsLoading] = useState(false);
  const handleOnParamChange = async () => {
    const queryObject = {
      size,
      threshold,
    };
    const queryString = buildQueryStringFromObject(queryObject);
    try {
      setIsLoading(true);
      const response = await productApi.searchByImage(searchImage, queryString);
      setProductList(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy danh sách sản phẩm mới');
    } finally {
      setIsLoading(false);
    }
  };
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    console.log('HI');
    handleOnParamChange();
  }, [size, threshold]);
  // console.log('Page: ');
  // console.log(productList, originalImageUrl);

  useEffect(() => {
    console.log('Product list: ', productList);
  }, [productList]);
  const handleImageSearchResults = (productList, searchImage) => {
    // Navigate to search results page with image search results
    setProductList(productList);
    setSearchImage(searchImage);
  };
  if (!searchImage)
    return (
      <div className="w-full h-150 flex items-center justify-center flex-col gap-4 bg-gray-100">
        <span className="text-[20px] font-medium">
          Hãy chọn hình ảnh để bắt đầu
        </span>
        <Button
          className={
            'rounded-none bg-(--color-preset-gray) text-[20px] h-12 w-60'
          }
          onClick={() => {
            setIsImageSearchOpen(true);
          }}
        >
          Chọn hình ảnh
        </Button>

        <ImageSearchDialog
          open={isImageSearchOpen}
          onOpenChange={setIsImageSearchOpen}
          onSearchResults={handleImageSearchResults}
        />
      </div>
    );
  return (
    <div className="flex flex-col gap-4 pl-15 pr-20 pb-25">
      <div className="flex gap-4 justify-center">
        <div className="w-70 space-y-2 ml-25">
          <img src={previewUrl} className="w-70 h-auto" />
          <Button
            variant={'outline'}
            onClick={() => setIsImageSearchOpen(true)}
            size="lg"
            className="w-70"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Chọn hình ảnh khác
          </Button>
        </div>

        <Separator orientation="vertical" />
        <div className="flex flex-col gap-4 pt-2">
          <span className="text-[20px] font-bold">Kết quả tìm kiếm</span>
          <div className="flex flex-col gap-4">
            <span className="text-[18px] font-medium text-(--color-preset-gray)">
              Tổng số sản phẩm
            </span>
            <span className="text-[20px] font-bold">
              {productList ? productList.length : 'Không xác định'}
            </span>
          </div>
          <Collapsible>
            <CollapsibleTrigger className=" group" asChild>
              <Button
                variant={'ghost'}
                className={'text-[16px] pl-0! flex justify-start w-100'}
              >
                Tùy chọn nâng cao
                <ChevronUp className="[[data-state=closed]>&]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 w-100">
              <div className="flex gap-2 items-center pl-5">
                <span className="font-medium">Giới hạn sản phẩm:</span>
                <div className="flex gap-2 ">
                  <Button
                    variant={'ghost'}
                    className={
                      size === 10
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setSize(10)}
                  >
                    10
                  </Button>
                  <Button
                    variant={'ghost'}
                    className={
                      size === 20
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setSize(20)}
                  >
                    20
                  </Button>
                  <Button
                    variant={'ghost'}
                    className={
                      size === 30
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setSize(30)}
                  >
                    30
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 items-center pl-5">
                <span className="font-medium">Ngưỡng phù hợp:</span>
                <div className="flex gap-1 ">
                  <Button
                    variant={'ghost'}
                    className={
                      threshold === 'low'
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setThreshold('low')}
                  >
                    Thấp
                  </Button>
                  <Button
                    variant={'ghost'}
                    className={
                      threshold === 'medium'
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setThreshold('medium')}
                  >
                    Trung bình
                  </Button>
                  <Button
                    variant={'ghost'}
                    className={
                      threshold === 'high'
                        ? 'bg-(--color-preset-gray) text-white rounded-full hover:bg-(--color-preset-gray/80) hover:text-white'
                        : 'bg-gray-100 rounded-full font-medium hover:bg-gray-100/80'
                    }
                    onClick={() => setThreshold('high')}
                  >
                    Cao
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
      <Separator />
      {productList && productList.length > 0 ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center gap-2">
              <Spinner />
              Đang tải, chờ tí nhé
            </div>
          ) : (
            <div className="flex flex-col gap-4 relative">
              {' '}
              <span className="text-center text-[18px]">
                {' '}
                Danh sách sản phẩm
              </span>
              <div className="grid grid-cols-4 gap-4">
                {productList.map((product) => (
                  <BriefProductCard briefProduct={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className="text-[20px] font-medium">
          Không có sản phẩm phù hợp
        </span>
      )}

      <ImageSearchDialog
        open={isImageSearchOpen}
        onOpenChange={setIsImageSearchOpen}
        onSearchResults={handleImageSearchResults}
      />
    </div>
  );
}
