import { ModalContext } from '@/contexts/ModalContext';
import { formatMoney } from '@/util';
import { ShoppingCart } from 'lucide-react';
import { useContext, useState } from 'react';
import ProductModal from './ProductModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function BriefProductCard({ briefProduct }) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const { openModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const openProductModal = () => {
    openModal({
      modalContent: <ProductModal productId={briefProduct.productId} />,
      useDefaultX: true,
      disableBackdropClose: true,
    });
  };
  // console.log('BD', briefProduct);
  if (!briefProduct.optionData || briefProduct.optionData.length === 0) return;
  return (
    <div className="flex flex-col gap-3 w-full h-auto">
      <div className="w-full h-auto relative">
        <img
          className="w-full h-auto cursor-pointer"
          src={briefProduct.optionData[selectedOptionIndex].optionImage}
          onClick={() => {
            navigate(`/product-detail/${briefProduct.productId}`);
          }}
        />
        <Button
          className="bottom-[10px] right-[10px] bg-white rounded-full absolute p-2 text-black"
          variant={'ghost'}
          onClick={openProductModal}
        >
          <ShoppingCart />
        </Button>
      </div>

      <div className="flex gap-1 pl-2">
        {briefProduct.optionData.map((option, index) => (
          <img
            src={option.optionImage}
            className={
              `w-[48px] h-[64px] cursor-pointer` +
              (index === selectedOptionIndex && ' pb-1 border-b border-b-black')
            }
            onClick={() => {
              setSelectedOptionIndex(index);
            }}
          />
        ))}
      </div>
      <span className="text-[14px] font-medium pl-2 leading-5">
        {briefProduct.name}
      </span>
      <span className="text-[14px] font-bold pl-2">
        {briefProduct.displayedPrice
          ? formatMoney(briefProduct.displayedPrice)
          : 'Không xác định'}{' '}
        VNĐ
      </span>
    </div>
  );
}
