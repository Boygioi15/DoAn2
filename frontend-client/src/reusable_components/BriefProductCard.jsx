import { ModalContext } from '@/contexts/ModalContext';
import { formatMoney } from '@/util';
import { ShoppingCart } from 'lucide-react';
import { useContext, useState } from 'react';
import ProductModal from './ProductModal';

export default function BriefProductCard({ briefProduct }) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const { openModal } = useContext(ModalContext);
  const openProductModal = () => {
    openModal({
      modalContent: <ProductModal productId={briefProduct.productId} />,
      useDefaultX: true,
      disableBackdropClose: true,
    });
  };
  return (
    <div
      className="flex flex-col gap-3 w-[250px] h-auto cursor-pointer"
      onClick={openProductModal}
    >
      <div className="w-full h-auto relative">
        <img
          className="w-full h-auto"
          src={briefProduct.optionData[selectedOptionIndex].optionImage}
        />
        <div className="bottom-[10px] right-[10px] bg-white rounded-full absolute p-2">
          <ShoppingCart />
        </div>
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
      <span className="text-[14px] font-medium pl-2">{briefProduct.name}</span>
      <span className="text-[14px] font-bold pl-2">
        {formatMoney(briefProduct.displayedPrice)} VNĐ
      </span>
    </div>
  );
}
