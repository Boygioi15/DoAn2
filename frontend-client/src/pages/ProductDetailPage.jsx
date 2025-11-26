import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatMoney } from '@/util';
import { ChevronLeft, ChevronRight, ChevronUpIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const [allProductVariant, setAllProductVariant] = useState(null);
  const [optionData, setOptionData] = useState(null);
  const [option2List, setOption2List] = useState(null);
  const [selectedOption1, setSelectedOption1] = useState(null);
  const [selectedOption2, setSelectedOption2] = useState(null);

  const getProductDetail = async (productId) => {
    try {
      const response = await productApi.getProductDetail(productId);
      const pDetail = response.data;
      setProductDetail(pDetail);
      setAllProductVariant(pDetail.allProductVariants);
      setOptionData(pDetail.optionData);
    } catch (error) {
      toast.error('Có lỗi khi lấy dữ liệu sản phẩm');
    }
  };
  const defaultSelectOption1 = async () => {
    if (!optionData) return;
    for (const option of optionData) {
      //eligible to select
      if (true) {
        setSelectedOption1(option.optionId);
        break;
      }
    }
  };
  const defaultSelectOption2 = async () => {
    if (!selectedOption1) return;
    for (const option of option2List) {
      //eligible to select
      if (true) {
        setSelectedOption2(option.optionId);
        break;
      }
    }
  };
  useEffect(() => {
    if (!optionData) return;
    defaultSelectOption1();
  }, [optionData]);
  useEffect(() => {
    if (!optionData) return;
    const option1 = optionData.find(
      (option) => option.optionId === selectedOption1
    );
    if (!option1) console.log('Error while select option 1, A');
    setOption2List(option1.subOption);
  }, [selectedOption1]);
  useEffect(() => {
    if (!selectedOption1) return;
    defaultSelectOption2();
  }, [option2List]);
  useEffect(() => {
    if (!productId) {
      return;
    }
    getProductDetail(productId);
  }, [productId]);

  ///rendering dât
  const productDescription = useMemo(() => {
    if (!productDetail) return null;
    return JSON.parse(productDetail.description);
  }, [productDetail]);
  const productProperty = useMemo(() => {
    if (!productDetail) return null;
    return JSON.parse(productDetail.propertyList);
  }, [productDetail]);

  let currentColor = 'Chưa xác định',
    currentSize = 'Chưa xác định';
  if (selectedOption1) {
    currentColor = optionData.find(
      (option) => option.optionId === selectedOption1
    ).optionValue;
  }
  if (option2List && selectedOption2) {
    currentSize = option2List.find(
      (option) => option.optionId === selectedOption2
    ).optionValue;
  }
  let currentUrlList = [];
  if (selectedOption1) {
    currentUrlList = optionData.find(
      (option) => option.optionId === selectedOption1
    ).optionImage;
  }
  const productPrice = useMemo(() => {
    if (allProductVariant && selectedOption1 && selectedOption2) {
      console.log('APV: ', allProductVariant);
      return allProductVariant.find(
        (variant) =>
          variant.optionId1 === selectedOption1 &&
          variant.optionId2 === selectedOption2
      ).price;
    }
    console.log('APV: ', allProductVariant);
    console.log('SO1: ', selectedOption1);
    console.log('SO2: ', selectedOption2);
    return 0;
  }, [allProductVariant, selectedOption1, selectedOption2]);

  if (!productDetail) return null;
  return (
    <div className="grid grid-cols-[1fr_1fr] text-[14px] font-medium pl-25 pr-25 gap-20">
      <div className="">
        <ImageShow imageURLList={currentUrlList} />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className={`flex flex-col *:leading-5 gap-1 `}>
          <span className={reusableStyle.productName}>
            {productDetail.name}
          </span>
          <span className={reusableStyle.sku}>
            Danh mục: {productDetail.categoryName} - Mã sản phẩm:{' '}
            {productDetail.sku}
          </span>
        </div>
        <span className={reusableStyle.price}>
          {formatMoney(productPrice)} VNĐ
        </span>
        {/* Color selection */}
        <div className={`flex flex-col gap-3 `}>
          <span>
            Màu sắc: <b>{currentColor}</b>
          </span>
          <div className="flex gap-2">
            {optionData.map((option1) => (
              <img
                className={
                  reusableStyle.colorImage +
                  (selectedOption1 === option1.optionId &&
                    reusableStyle.colorImageSelected)
                }
                onClick={() => setSelectedOption1(option1.optionId)}
                src={option1.optionImage[0]}
              />
            ))}
          </div>
        </div>
        {/* Size selection */}
        <div className={`flex flex-col gap-3 `}>
          <span>
            Kích thước: <b>{currentSize}</b>
          </span>
          <div className="flex gap-2">
            {option2List &&
              option2List.map((option2) => (
                <button
                  className={
                    reusableStyle.sizeButton +
                    (selectedOption2 === option2.optionId &&
                      reusableStyle.sizeButtonSelected)
                  }
                  onClick={() => setSelectedOption2(option2.optionId)}
                >
                  {option2.optionValue}
                </button>
              ))}
          </div>
        </div>

        <div className={reusableStyle.blockBorderBottom + ' w-full'}>
          <button className="button-standard-1 w-full">
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
        <Collapsible
          className={
            reusableStyle.block + ` ` + reusableStyle.blockBorderBottom
          }
          defaultOpen
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={'w-full justify-between pl-0! pr-0'}
            >
              <div className={reusableStyle.blockTitle}>Mô tả sản phẩm</div>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className="max-w-none leading-5 pl-2"
              dangerouslySetInnerHTML={{ __html: productDescription }}
            />
          </CollapsibleContent>
        </Collapsible>
        <Collapsible
          className={
            reusableStyle.block + ' ' + reusableStyle.blockBorderBottom
          }
          defaultOpen
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={'w-full justify-between pl-0! pr-0'}
            >
              <div className={reusableStyle.blockTitle}>
                Thuộc tính sản phẩm
              </div>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className={
                `flex flex-col text-[14px] ` + reusableStyle.blockBorderBottom
              }
            >
              {productProperty.map((property) => (
                <div className="grid grid-cols-[100px_100px] leading-8 pl-2">
                  <span>{property.name}:</span>
                  <span>{property.value}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

function ImageShow({ imageURLList }) {
  const [index, setIndex] = useState(0);
  const prev = () => {
    setIndex((i) => (i - 1 + imageURLList.length) % imageURLList.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % imageURLList.length);
  };
  return (
    <div className="flex gap-4">
      {/* BIG IMAGE AREA */}
      <div className="relative w-full h-auto overflow-hidden">
        {/* Slides wrapper */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {imageURLList.map((url, i) => (
            <img
              key={i}
              src={url}
              className="w-full h-auto object-cover flex-shrink-0"
            />
          ))}
        </div>

        {/* Left button */}
        <button
          onClick={prev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${reusableStyle.transitButton}`}
        >
          <ChevronLeft />
        </button>

        {/* Right button */}
        <button
          onClick={next}
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${reusableStyle.transitButton}`}
        >
          <ChevronRight />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {imageURLList.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                index === i ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {imageURLList.map((url, i) => (
          <img
            key={i}
            src={url}
            onClick={() => setIndex(i)}
            className={`
              w-[60px] h-[80px] object-cover cursor-pointer 
              border transition-all duration-200
              ${i === index && reusableStyle.imageShowSelected}
            `}
          />
        ))}
      </div>
    </div>
  );
}

const reusableStyle = {
  blockBorderBottom: 'border-b border-b-gray-200 pb-5',
  productName: 'font-bold text-[16px]',
  sku: 'font-medium text-[14px] text-muted-foreground',
  price: 'font-bold text-[20px] leading-7',
  blockTitle: 'font-bold text-[14px] ',
  colorImage: 'w-[48px] h-[64px] cursor-pointer ',
  colorImageSelected: 'border-b border-black pb-[2px]',
  sizeButton:
    'w-[48px] h-[48px] flex items-center justify-center border border-[var(--color-preset-gray)] rounded-[4px] cursor-pointer ',
  sizeButtonSelected: 'bg-[var(--color-preset-gray)] text-white',
  imageShow: 'w-[60px] h-[80px] cursor-pointer',
  imageShowSelected: 'border border-black p-[2px]',
  transitButton:
    'w-[40px] h-[40px] bg-[hsla(0,0%,100%,.4)] rounded-[4px] hover:bg-white cursor-pointer items-center justify-center flex text-[var(--color-preset-gray)]',
};
