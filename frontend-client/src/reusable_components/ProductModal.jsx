import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ModalContext } from '@/contexts/ModalContext';
import { formatMoney } from '@/util';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronUpIcon,
} from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function ProductModal({ productId }) {
  const navigate = useNavigate();
  const { closeModal } = useContext(ModalContext);
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

  const handleDetailClick = () => {
    navigate(`/product-detail/${productId}`);
    closeModal();
  };

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
    <div className="flex flex-col w-[500px] h-auto text-(--color-preset-gray)] pt-4 pr-8 pl-8 gap-4 text-[12px]">
      <div className={reusableStyle.blockBorderBottom}>
        <h1 className={reusableStyle.modalTitle}>Thông tin sản phẩm</h1>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-3 leading-4 ">
        <img src={currentUrlList[0]} />
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <span className={reusableStyle.productName}>
              {productDetail.name}
            </span>
            <span className={reusableStyle.sku}>
              Danh mục: {productDetail.categoryName}
            </span>
            <span className={reusableStyle.sku}>
              Mã sản phẩm: {productDetail.sku}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={reusableStyle.price}>
              {formatMoney(productPrice)} VNĐ
            </span>
            <Button
              className="flex items-center text-(--color-preset-red) hover:text-(--color-preset-red) cursor-pointer"
              variant={'ghost'}
              onClick={handleDetailClick}
            >
              Chi tiết
              <ChevronsRight /> {`  `}
            </Button>
          </div>
        </div>
      </div>
      <div className=""></div>
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
        <button className="button-standard-1 w-full text-[16px]!">
          THÊM VÀO GIỎ HÀNG
        </button>
      </div>
    </div>
  );
}

const reusableStyle = {
  modalTitle: 'text-[16px] font-bold leading-[26px] text-center',
  blockBorderBottom: 'border-b border-b-gray-200 pb-5',
  productName: 'font-bold text-[14px]',
  sku: 'font-medium text-[12px] text-muted-foreground',
  price: 'font-bold text-[16px] leading-7',
  colorImage: 'w-[48px] h-[64px] cursor-pointer ',
  colorImageSelected: 'border-b border-black pb-[2px]',
  sizeButton:
    'w-[36px] h-[36px] flex items-center justify-center border border-[var(--color-preset-gray)] rounded-[4px] cursor-pointer ',
  sizeButtonSelected: 'bg-[var(--color-preset-gray)] text-white',
  imageShow: 'w-[60px] h-[80px] cursor-pointer',
  imageShowSelected: 'border border-black p-[2px]',
};
