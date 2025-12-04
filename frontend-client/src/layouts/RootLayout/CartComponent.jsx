import { cartApi } from '@/api/cartApi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useCartStore from '@/contexts/zustands/CartStore';
import { formatMoney } from '@/util';
import { EllipsisVertical, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function CartWrapper() {
  const cartItemList = useCartStore((s) => s.cartItemList);
  const totalItem = useCartStore((s) => s.totalItem);
  const cashoutPrice = useCartStore((s) => s.cashoutPrice);
  const getCartData = useCartStore((s) => s.getCartData);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    getCartData();
  }, []);
  return (
    <Sheet open={sheetOpen} onOpenChange={(open) => setSheetOpen(open)}>
      <SheetTrigger asChild>
        <Button
          variant={'ghost'}
          className={
            'flex flex-col gap-1 h-full p-0! items-center justify-center '
          }
        >
          <div className="relative">
            <ShoppingBag style={{ width: '24px', height: '24px' }} />
            {totalItem && (
              <span className="absolute bg-red-500 text-white text-[12px] font-medium rounded-full w-4 h-4 -top-1 -right-1">
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
  console.log('CL: ', cartItemList);
  return (
    <div className="flex flex-col relative h-[100vh] ">
      <h2 className="text-[16px] font-bold leading-6 p-6">Giỏ hàng</h2>
      <Separator />
      <div className="flex flex-col gap-2 pt-2 h-full ">
        <div className="flex items-center justify-between pl-5 pr-5 pt-2 pb-1">
          <span className="flex items-center gap-2 text-[14px] font-medium">
            <Checkbox />
            Chọn tất cả
          </span>
          <span className="text-muted-foreground text-[12px]">
            Bạn đã chọn 2 sản phẩm
          </span>
        </div>
        <div className="max-h-full h-auto flex flex-col gap-2">
          {cartItemList.map((item, index) => (
            <div key={item.cartItemId}>
              {index > 0 && <Separator />}
              <CartItem cartItem={item} setSheetOpen={setSheetOpen} />
            </div>
          ))}
        </div>
        <div className="h-full bg-[#f5f5f5]"></div>
      </div>
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-6 bg-white gap-4 shadow-3xl">
        <span className="flex justify-between text-[14px] font-bold">
          <span>Tạm tính</span>
          <span>{formatMoney(cashoutPrice)} VNĐ</span>
        </span>
        <button className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold!">
          THANH TOÁN
        </button>
      </div>
    </div>
  );
}
function CartItem({ cartItem, setSheetOpen }) {
  console.log('CI: ', cartItem);
  const navigate = useNavigate();
  return (
    <div className="flex gap-5 p-5 pt-2 pb-2 ">
      <div className="flex items-center">
        <Checkbox checked={cartItem.selected} />
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
        <Button
          className={reusableStyle.button + ' bg-[#f4f6f9]'}
          variant={'ghost'}
        >
          <EllipsisVertical />
        </Button>
        <div className="flex gap-3 items-center">
          <Button className={reusableStyle.button} variant={'outline'}>
            {' '}
            <Minus />
          </Button>
          {cartItem.quantity}
          <Button
            className={reusableStyle.button}
            variant={'outline'}
            disabled={cartItem.quantity === cartItem.maxAllowedQuantity}
          >
            <Plus />
          </Button>
        </div>
      </div>
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
