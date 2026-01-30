import { productApi } from '@/api/productApi';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ModalContext } from '@/contexts/ModalContext';
import useCartStore from '@/contexts/zustands/CartStore';
import { formatMoney } from '@/util';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronUpIcon,
  Ruler,
} from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import SpinnerOverlay from './SpinnerOverlay';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

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
    for (const option1 of optionData) {
      //eligible to select
      let totalStock = 0;
      totalStock = option1.subOption.reduce((acc, option2) => {
        const option2Stock = allProductVariant.find(
          (variant) =>
            variant.optionId1 === option1.optionId &&
            variant.optionId2 === option2.optionId
        ).stock;
        return Number(acc) + Number(option2Stock);
      }, 0);
      console.log('O1TS: ', option1, totalStock);
      if (totalStock !== 0) {
        setSelectedOption1(option1.optionId);
        return;
      }
    }
    setSelectedOption1(optionData[0].optionId);
  };
  const defaultSelectOption2 = async () => {
    if (!selectedOption1) return;
    for (const option of option2List) {
      //eligible to select
      const associatedVariant = allProductVariant.find(
        (variant) =>
          variant.optionId1 === selectedOption1 &&
          variant.optionId2 === option.optionId
      );
      if (!associatedVariant || associatedVariant.stock > 0) {
        setSelectedOption2(option.optionId);
        return;
      }
    }
    setSelectedOption2(option2List[0].optionId);
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
    const sorted = option1.subOption.sort((a, b) => {
      // For string values (like "S", "M", "L")
      return a.optionValue.localeCompare(b.optionValue, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
    console.log('Sorted: ', sorted);
    setOption2List(sorted);
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

  const productVariant = useMemo(() => {
    if (!selectedOption1 || !selectedOption2) return;
    const associatedVar = allProductVariant.find(
      (variant) =>
        variant.optionId1 === selectedOption1 &&
        variant.optionId2 === selectedOption2
    );
    return associatedVar;
  }, [selectedOption1, selectedOption2]);
  const disabledOption1IdList = useMemo(() => {
    if (!optionData || !allProductVariant) return [];
    const disabledList = [];
    for (const option1 of optionData) {
      let totalStock = 0;
      totalStock = option1.subOption.reduce((acc, option2) => {
        const option2Stock = allProductVariant.find(
          (variant) =>
            variant.optionId1 === option1.optionId &&
            variant.optionId2 === option2.optionId
        ).stock;
        return Number(acc) + Number(option2Stock);
      }, 0);
      console.log('O1TS: ', option1, totalStock);
      if (totalStock === 0) {
        disabledList.push(option1.optionId);
      }
    }
    console.log('DL: ', disabledList);
    return disabledList;
  }, [optionData]);

  const sizeGuidance = useMemo(() => {
    if (!productDetail) return null;
    return JSON.parse(productDetail.sizeGuidance);
  }, [productDetail]);
  const sizeGuidanceHeaderList = useMemo(() => {
    const headerList = ['Kích cỡ'];
    if (sizeGuidance && sizeGuidance.length > 0) {
      if (sizeGuidance[0].fit.height) {
        headerList.push('Chiều cao (cm)');
      }
      if (sizeGuidance[0].fit.weight) {
        headerList.push('Cân nặng (kg)');
      }
      if (sizeGuidance[0].fit.bust) {
        headerList.push('Vòng 1 (cm)');
      }
      if (sizeGuidance[0].fit.waist) {
        headerList.push('Vòng 2 (cm)');
      }
      if (sizeGuidance[0].fit.hip) {
        headerList.push('Vòng 3 (cm)');
      }
    }
    return headerList;
  }, [sizeGuidance]);

  //cart functionalities
  const [addLoading, setAddLoading] = useState(false);

  const addItemToCart = useCartStore((s) => s.addItemToCart);
  const getCartData = useCartStore((s) => s.getCartData);
  const setSheetOpen = useCartStore((s) => s.setSheetOpen);

  const handleAddItemToCart = async () => {
    try {
      setAddLoading(true);
      const result = await addItemToCart({
        productId: productId,
        variantId: productVariant.variantId,
      });
      await getCartData();
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex items-center gap-3 p-4 border-l-4 border-l-green-700`}
        >
          <div className="flex gap-4">
            <img
              src={currentUrlList[0]}
              className=" w-[60px] h-[80px] object-cover cursor-pointer 
              border"
            />
            <p className="text-[14px] font-medium text-black leading-5 pt-2">
              Sản phẩm đã được thêm vào giỏ hàng
            </p>
          </div>

          <Button
            onClick={() => {
              toast.dismiss(t.id);
              setSheetOpen(true);
            }}
            variant={'outline'}
            className="button-standard-2 text-[black]"
          >
            Xem ngay
          </Button>
        </div>
      ));
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi thêm mới sản phẩm');
    } finally {
      setAddLoading(false);
    }
  };

  if (!productDetail) return null;
  return (
    <div className="flex flex-col w-[500px] h-auto text-(--color-preset-gray)] pt-4 pr-8 pl-8 gap-4 text-[12px]">
      {addLoading && <SpinnerOverlay />}
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
            <button
              disabled={
                disabledOption1IdList.length > 0 &&
                disabledOption1IdList.includes(option1.optionId)
              }
              className={
                `relative ` +
                (disabledOption1IdList.length > 0 &&
                  disabledOption1IdList.includes(option1.optionId) &&
                  'pointer-events-none opacity-50')
              }
            >
              <img
                className={
                  reusableStyle.colorImage +
                  (selectedOption1 === option1.optionId &&
                    reusableStyle.colorImageSelected)
                }
                onClick={() => setSelectedOption1(option1.optionId)}
                src={option1.optionImage[0]}
              />
            </button>
          ))}
        </div>
      </div>
      {/* Size selection */}
      <div className={`flex flex-col gap-3 `}>
        <div className="flex justify-between">
          <span>
            Kích thước: <b>{currentSize}</b>
          </span>
          <Sheet>
            <SheetTrigger>
              <span className="text-blue-600 text-sm flex gap-2 cursor-pointer hover:underline">
                <Ruler /> Gợi ý tìm kích thước
              </span>
            </SheetTrigger>
            <SheetContent className={' w-fit! max-w-200!'}>
              <SheetHeader>
                <SheetTitle>Bảng gợi ý kích thước</SheetTitle>
                <SheetDescription>
                  Hãy chọn kích thước phù hợp với bạn
                </SheetDescription>
              </SheetHeader>
              <Separator className={'mx-4'} />
              <Table
                className={
                  'w-fit mx-5  [&_td]:border [&_td]:text-center  [&_td]:border-gray-400'
                }
              >
                <TableHeader>
                  {' '}
                  <TableRow>
                    {sizeGuidanceHeaderList.map((header, index) => (
                      <TableCell
                        className={
                          'w-20 bg-gray-700 hover:bg-gray-700/90 text-white text-[14px] font-medium ' +
                          (index === 0 && ' text-left!')
                        }
                        key={index}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sizeGuidance.map((size) => (
                    <TableRow
                      className={
                        '[&_td]:text-[14px] font-medium cursor-pointer'
                      }
                    >
                      <TableCell className="w-25 text-left! bg-gray-700 hover:bg-gray-700/80 text-white text-[14px] font-medium">
                        {size.name}
                      </TableCell>
                      {size.fit.height && (
                        <TableCell>
                          {size.fit.height.min} - {size.fit.height.max}
                        </TableCell>
                      )}
                      {size.fit.weight && (
                        <TableCell className={'w-20'}>
                          {size.fit.weight.min} - {size.fit.weight.max}
                        </TableCell>
                      )}
                      {size.fit.bust && (
                        <TableCell className={'w-20'}>
                          {size.fit.bust.min} - {size.fit.bust.max}
                        </TableCell>
                      )}
                      {size.fit.waist && (
                        <TableCell className={'w-20'}>
                          {size.fit.waist.min} - {size.fit.waist.max}
                        </TableCell>
                      )}
                      {size.fit.hip && (
                        <TableCell className={'w-20'}>
                          {size.fit.hip.min} - {size.fit.hip.max}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-2">
          {option2List &&
            option2List.map((option2) => {
              let _disabled = false;
              if (selectedOption1 && selectedOption2) {
                const associatedVariant = allProductVariant.find(
                  (variant) =>
                    variant.optionId1 === selectedOption1 &&
                    variant.optionId2 === option2.optionId
                );
                if (!associatedVariant) _disabled = false;
                else if (associatedVariant.stock === 0) _disabled = true;

                // console.log('O2: ', option2);
                // console.log('AV: ', associatedVariant);
                // console.log('D: ', _disabled);
              }

              return (
                <button
                  className={
                    reusableStyle.sizeButton +
                    (selectedOption2 === option2.optionId &&
                      reusableStyle.sizeButtonSelected) +
                    (_disabled && reusableStyle.sizeButtonDisabled)
                  }
                  disabled={_disabled}
                  onClick={() => setSelectedOption2(option2.optionId)}
                >
                  {option2.optionValue}
                </button>
              );
            })}
        </div>
      </div>

      <div className={reusableStyle.blockBorderBottom + ' w-full'}>
        <button
          className="button-standard-1 w-full"
          disabled={productVariant && productVariant.stock === 0}
          onClick={handleAddItemToCart}
        >
          {productVariant && productVariant.stock === 0
            ? 'ĐÃ HẾT HÀNG'
            : 'THÊM VÀO GIỎ HÀNG'}
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
  sizeButtonSelected: 'bg-[var(--color-preset-gray)] text-white ',
  sizeButtonDisabled: ' opacity-50 cursor-not-allowed pointer-events-none',
  imageShow: 'w-[60px] h-[80px] cursor-pointer',
  imageShowSelected: 'border border-black p-[2px]',
};
