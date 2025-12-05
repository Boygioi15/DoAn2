import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ItemListBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>
        <ShoppingBag /> Sản phẩm
      </span>
    </div>
  );
}
function ItemBlock({ itemBlock }) {
  const { openModal } = useContext(ModalContext);
  const navigate = useNavigate();
  return (
    <div
      className={
        'flex gap-5 p-5 pt-2 pb-2 relative ' +
        (item.quantity > item.maxAllowedQuantity && 'bg-red-50')
      }
    >
      <img
        className="w-20 h-30 rounded-1 cursor-pointer"
        onClick={() => {
          navigate(`product-detail/${item.productId}`);
        }}
        src={item.product_thumbnail}
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <span
            className={reuseableStyle.itemName}
            onClick={() => {
              navigate(`product-detail/${item.productId}`);
              setSheetOpen(false);
            }}
          >
            {item.product_name}
          </span>
          <span className={reuseableStyle.itemSku}>
            Mã sản phẩm: {item.productSku} - Mã biến thể: {item.variantSku}
          </span>
          <span className={reuseableStyle.itemSubInfo}>
            <img src={item.variant_thumbnail} className="w-6 h-8" />{' '}
            {item.variant_color} | {item.variant_size}
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <span>x{item.quantity}</span>
          <span className={reusableStyle.itemPrice}>
            {formatMoney(item.totalPrice)} VNĐ
          </span>
        </div>
      </div>
    </div>
  );
}
const reuseableStyle = {
  progressBlock: 'flex gap-2 items-center',
  progressText: 'text-[14px] font-medium text-[var(--color-preset-gray)]',
  progressTextMarked: 'text-blue-500',
  progressCircle:
    'w-[30px] h-[30px] flex items-center justify-center text-[14px] font-[400px] bg-[#e5eaf0] text-black rounded-full ',
  progressCircleMarked: 'bg-blue-500 text-white',
  progressArrow: 'w-[30px] h-[30px] text-black',
  progressArrowMarked: ' text-blue-500',

  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-6 mb-4',

  checkBox: '',
  itemPrice: 'text-[#333f48] text-[14px] font-bold leading-5',
  itemName:
    'text-[#333f48] text-[13px] font-medium leading-5 text-black cursor-pointer',
  itemSku: 'text-muted-foreground',
  itemSubInfo:
    ' flex gap-2 items-center text-[12px] font-medium leading-5 text-muted-foreground',
  button: 'w-7 h-7 rounded-full p-0 items-center justify-center',
};
