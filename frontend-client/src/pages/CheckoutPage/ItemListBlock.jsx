import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useCartStore from '@/contexts/zustands/CartStore';
import SpinnerOverlay from '@/reusable_components/SpinnerOverlay';
import { formatMoney } from '@/util';
import {
  Edit,
  EllipsisVertical,
  Minus,
  Plus,
  ShoppingBag,
  Trash,
} from 'lucide-react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckoutPageContext } from './CheckoutPage';

export default function ItemListBlock({ cartItemList }) {
  const itemListDisplay = cartItemList.map((item, index) => (
    <ItemBlock item={item} isOverflow={true} />
  ));
  const [showMore, setShowMore] = useState(false);
  const totalItem = cartItemList.reduce((acc, cur) => acc + cur.quantity, 0);
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>
        <ShoppingBag /> Sản phẩm ({totalItem})
      </span>
      <div className="flex flex-col gap-2 pl-2 pr-2 pt-2 max-h-150 overflow-y-scroll">
        {showMore ? itemListDisplay.slice(0, 2) : itemListDisplay}
      </div>
      {cartItemList.length > 2 && (
        <Button
          className="text-blue-500 text-center cursor-pointer hover:text-blue-600"
          onClick={() => setShowMore((prev) => !prev)}
          variant="ghost"
        >
          <span className="shadow-xs">
            {showMore ? 'Xem thêm +' : 'Thu gọn -'}
          </span>
        </Button>
      )}
    </div>
  );
}
function ItemBlock({ item }) {
  const { getAndUpdateCartTransactionData } = useContext(CheckoutPageContext);
  const updateCartItemQuantity = useCartStore((s) => s.updateCartItemQuantity);
  const deleteCartItem = useCartStore((s) => s.deleteCartItem);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const invalidState = item.invalidState;
  const isUpdated = item.isUpdated;
  const handleUpdate = async (state) => {
    try {
      if (state) {
        await updateCartItemQuantity(item.cartItemId, item.quantity + 1);
      } else {
        if (item.quantity > 1) {
          await updateCartItemQuantity(item.cartItemId, item.quantity - 1);
        } else {
          setShowDeleteDialog(true);
          return;
        }
      }
      await getAndUpdateCartTransactionData();
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi tùy chỉnh số lượng sản phẩm');
    } finally {
    }
  };
  const handleDelete = async () => {
    try {
      await deleteCartItem(item.cartItemId);
      await getAndUpdateCartTransactionData();
    } catch (error) {
      toast.error('Có lỗi khi xoá sản phẩm');
    }
  };

  return (
    <div
      className={
        'flex gap-5 p-5 pt-2 pb-2 relative ' +
        (invalidState !== 'normal' && 'bg-red-50')
      }
    >
      {invalidState === 'invalid' && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-100 flex items-center justify-center">
          <Button
            variant="outline"
            className="text-black opacity-100"
            onClick={handleDelete}
          >
            Xóa sản phẩm
          </Button>
        </div>
      )}
      {isUpdated && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="absolute top-1.5 left-3.5 size-2.5 animate-bounce rounded-full bg-green-600 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent>Sản phẩm có sự thay đổi</TooltipContent>
        </Tooltip>
      )}
      <img
        className="w-20 h-30 rounded-1 cursor-pointer"
        onClick={() => {
          window.open(`/product-detail/${item.productId}`);
          setSheetOpen(false);
        }}
        src={item.product_thumbnail}
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <span
            className={reuseableStyle.itemName}
            onClick={() => {
              window.open(`/product-detail/${item.productId}`);
              setSheetOpen(false);
            }}
          >
            {item.product_name}
          </span>
          <span className={reuseableStyle.itemSubInfo}>
            Mã sản phẩm: {item.product_sku} - Mã biến thể: {item.variant_sku}
          </span>
          <span className={reuseableStyle.itemSubInfo}>
            <img src={item.variant_thumbnail} className="w-6 h-8" />{' '}
            {item.variant_color} | {item.variant_size}
          </span>
        </div>

        <span className={reuseableStyle.itemPrice}>
          {formatMoney(item.unitPrice)} VNĐ
        </span>
      </div>
      <div className="flex flex-col justify-between items-end grow">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={reuseableStyle.button + ' bg-[#f4f6f9]'}
              variant={'ghost'}
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit text-[14px] cursor-pointer " // width and text size
            align="start"
          >
            <DropdownMenuItem className="flex items-center gap-2 w-fit cursor-pointer ">
              <Edit className="text-[16px] w-4" />
              <span className="text-[14px]">Chỉnh sửa sản phẩm</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 w-fit cursor-pointer "
            >
              <Trash className="text-[16px] w-4" />
              <span className="text-[14px]">Xóa sản phẩm</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-col gap-2">
          {invalidState === 'overflow' && (
            <span className="text-[red] text-[12px] font-bold text-end w-fit">
              Vượt quá số lượng cho phép
            </span>
          )}
          {invalidState === 'outOfStock' && (
            <span className="text-[red] text-[12px] font-bold text-end w-fit">
              Sản phẩm đã hết hàng
            </span>
          )}
          {invalidState === 'invalid' && (
            <span className="text-[red] text-[12px] font-bold text-end w-fit">
              Sản phẩm không còn mở bán!
            </span>
          )}
        </div>
        <div
          className={
            'flex gap-3 items-center ' +
            ((invalidState === 'outOfStock' || invalidState == 'invalid') &&
              ' pointer-events-none opacity-50')
          }
        >
          <Button
            className={reuseableStyle.button}
            variant={'outline'}
            onClick={() => handleUpdate(false)}
          >
            {' '}
            <Minus />
          </Button>
          {item.quantity}
          <Button
            className={reuseableStyle.button}
            variant={'outline'}
            disabled={item.quantity >= item.maxAllowedQuantity}
            onClick={() => handleUpdate(true)}
          >
            <Plus />
          </Button>
        </div>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={'w-100'}>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription
              className={'text-[14px] font-medium text-black'}
            >
              Bạn có chắc chắn muốn xóa sản phẩm khỏi giỏ hàng?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="button-standard-2"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </button>
            <button
              className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold!"
              onClick={() => {
                handleDelete();
                setShowDeleteDialog(false);
              }}
            >
              Đồng ý
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-6 mb-4',

  checkBox: '',
  itemPrice: 'text-[#333f48] text-[14px] font-bold leading-5 text-red-500',
  itemName:
    'text-[#333f48] text-[14px] font-medium leading-5 text-black cursor-pointer',
  itemSku: 'text-muted-foreground text-[12px]',
  itemSubInfo:
    ' flex gap-2 items-center text-[12px] font-medium leading-5 text-muted-foreground',
  button: 'w-7 h-7 rounded-full p-0 items-center justify-center',
};
