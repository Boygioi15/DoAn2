import { cartApi } from '@/api/cartApi';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModalContext } from '@/contexts/ModalContext';
import { UltilityContext_1 } from '@/contexts/UltilityContext_1';
import useAuthStore from '@/contexts/zustands/AuthStore';
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
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function CartWrapper() {
  const cartId = useCartStore((s) => s.cartId);
  const userId = useCartStore((s) => s.userId);
  const cartItemList = useCartStore((s) => s.cartItemList);
  const totalItem = useCartStore((s) => s.totalItem);
  const cashoutPrice = useCartStore((s) => s.cashoutPrice);
  const getCartData = useCartStore((s) => s.getCartData);
  const mergeCart = useCartStore((s) => s.mergeCartOfUserWithAnonymous);
  const sheetOpen = useCartStore((s) => s.sheetOpen);
  const setSheetOpen = useCartStore((s) => s.setSheetOpen);

  const accessToken = useAuthStore((s) => s.accessToken);
  const { convenience_1 } = useContext(UltilityContext_1);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const getCartDataWrapper = async () => {
    try {
      //merge cart request
      console.log('CI: ', cartId);
      console.log('CIL: ', cartItemList);
      console.log('AT: ', accessToken);
      if (cartId && cartItemList && accessToken && !userId) {
        console.log('HI');
        setShowMergeDialog(true);
      } else {
        const response = await getCartData();
      }
    } catch (error) {
      console.log(error);
      if (error.authError) {
        convenience_1();
      }
    }
  };
  useEffect(() => {
    getCartDataWrapper();
  }, []);
  return (
    <Sheet open={sheetOpen} onOpenChange={(open) => setSheetOpen(open)}>
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent className={'w-100'}>
          <AlertDialogHeader>
            <AlertDialogTitle>Gộp giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription
              className={'text-[14px] font-medium text-black leading-5'}
            >
              Hệ thống phát hiện thấy đã có một giỏ hàng ẩn danh từ trước. Bạn
              có muốn gộp giỏ hàng?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="button-standard-2"
              onClick={() => {
                getCartData();
                setShowMergeDialog(false);
              }}
            >
              Hủy
            </button>
            <button
              className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold!"
              onClick={() => {
                mergeCart();
                setShowMergeDialog(false);
              }}
            >
              Đồng ý
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <SheetTrigger asChild>
        <Button
          variant={'ghost'}
          className={
            'flex flex-col gap-1 h-full p-1! items-center justify-center '
          }
        >
          <div className="relative">
            <ShoppingBag style={{ width: '24px', height: '24px' }} />
            {totalItem > 0 && (
              <span className="absolute bg-red-500 text-white text-[12px] font-medium rounded-full w-4.5 h-4.5 -top-1 -right-2.5">
                {totalItem}
              </span>
            )}
          </div>

          <span className="text-[14px] font-medium"> Giỏ hàng</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-135! w-135">
        {cartItemList ? (
          <CartSheet
            cartItemList={cartItemList}
            cashoutPrice={cashoutPrice}
            setSheetOpen={setSheetOpen}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[14px] font-medium">
            Hiện bạn chưa thêm sản phẩm vào giỏ hàng
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
function CartSheet({ cartItemList, cashoutPrice, setSheetOpen }) {
  const navigate = useNavigate();

  const allowedToPurchase = useCartStore((s) => s.allowedToPurchase);
  const updateCartSelected = useCartStore((s) => s.updateCartSelected);
  const allSelected = useCartStore((s) => s.allSelected);
  const totalSelected = useCartStore((s) => s.totalSelected);
  const totalItem = useCartStore((s) => s.totalItem);
  const [loading, setLoading] = useState(false);
  const handleSelect = async () => {
    try {
      setLoading(true);
      await updateCartSelected(!allSelected);
      await getCartData();
    } catch (error) {
      toast.error('Có lỗi khi cập nhật giỏ hàng');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col relative h-[100vh] ">
      {loading && <SpinnerOverlay />}
      <h2 className="text-[16px] font-bold leading-6 p-6">
        Giỏ hàng ({totalItem})
      </h2>
      <Separator />
      <div className="flex flex-col gap-2 pt-2 h-full">
        <div className="flex items-center justify-between pl-5 pr-5 pt-2 pb-1">
          <span className="flex items-center gap-2 text-[14px] font-medium">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => handleSelect()}
            />
            Chọn tất cả
          </span>
          <span className="text-muted-foreground text-[12px]">
            Bạn đã chọn {totalSelected} sản phẩm
          </span>
        </div>
        <div className="h-full flex flex-col grow gap-2 overflow-y-scroll pb-50 bg-[#f5f5f5]">
          <div className="bg-white">
            {cartItemList.map((item, index) => (
              <div key={item.cartItemId}>
                {index > 0 && <Separator />}
                <CartItem cartItem={item} setSheetOpen={setSheetOpen} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-6 bg-white gap-4 shadow-3xl">
        <span className="flex justify-between text-[14px] font-bold">
          <span>Tạm tính</span>
          <span>{formatMoney(cashoutPrice)} VNĐ</span>
        </span>
        <button
          className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold!"
          disabled={!allowedToPurchase}
          onClick={() => {
            console.log('HI');
            navigate('/checkout');
          }}
        >
          THANH TOÁN
        </button>
      </div>
    </div>
  );
}
function CartItem({ cartItem, setSheetOpen }) {
  const updateCartItemQuantity = useCartStore((s) => s.updateCartItemQuantity);
  const updateCartItemSelected = useCartStore((s) => s.updateCartItemSelected);
  const getCartData = useCartStore((s) => s.getCartData);
  const deleteCartItem = useCartStore((s) => s.deleteCartItem);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const invalidState = cartItem.invalidState;
  const handleUpdate = async (state) => {
    try {
      setLoading(true);
      if (state) {
        await updateCartItemQuantity(
          cartItem.cartItemId,
          cartItem.quantity + 1
        );
      } else {
        if (cartItem.quantity > 1) {
          await updateCartItemQuantity(
            cartItem.cartItemId,
            cartItem.quantity - 1
          );
        } else {
          setShowDeleteDialog(true);
        }
      }
      await getCartData();
    } catch (error) {
      toast.error('Có lỗi khi tùy chỉnh số lượng sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCartItem(cartItem.cartItemId);
      await getCartData();
    } catch (error) {
      toast.error('Có lỗi khi xoá sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  const handleSelect = async () => {
    try {
      setLoading(true);
      await updateCartItemSelected(cartItem.cartItemId, !cartItem.selected);
      await getCartData();
    } catch (error) {
      toast.error('Có lỗi khi cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();
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
      {loading && <SpinnerOverlay />}
      <div className="flex items-center">
        <Checkbox
          checked={cartItem.selected}
          onCheckedChange={() => handleSelect()}
        />
      </div>

      <img
        className="w-20 h-30 rounded-1 cursor-pointer"
        onClick={() => {
          navigate(`product-detail/${cartItem.productId}`);
          setSheetOpen(false);
        }}
        src={cartItem.product_thumbnail}
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <span
            className={reusableStyle.cartName}
            onClick={() => {
              navigate(`product-detail/${cartItem.productId}`);
              setSheetOpen(false);
            }}
          >
            {cartItem.product_name}
          </span>
          <span className={reusableStyle.cartSubInfo}>
            <img src={cartItem.variant_thumbnail} className="w-6 h-8" />{' '}
            {cartItem.variant_color} | {cartItem.variant_size}
          </span>
        </div>

        <span className={reusableStyle.cartPrice}>
          {formatMoney(cartItem.unitPrice)} VNĐ
        </span>
      </div>
      <div className="flex flex-col justify-between items-end grow">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={reusableStyle.button + ' bg-[#f4f6f9]'}
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
            className={reusableStyle.button}
            variant={'outline'}
            onClick={() => handleUpdate(false)}
          >
            {' '}
            <Minus />
          </Button>
          {cartItem.quantity}
          <Button
            className={reusableStyle.button}
            variant={'outline'}
            disabled={cartItem.quantity >= cartItem.maxAllowedQuantity}
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

const reusableStyle = {
  checkBox: '',
  cartPrice: 'text-[#333f48] text-[14px] font-bold leading-5',
  cartName:
    'text-[#333f48] text-[13px] font-medium leading-5 text-black cursor-pointer',
  cartSubInfo:
    ' flex gap-2 items-center text-[12px] font-medium leading-5 text-muted-foreground',
  button: 'w-7 h-7 rounded-full p-0 items-center justify-center',
};
