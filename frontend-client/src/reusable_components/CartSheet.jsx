import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/util';
import { EllipsisVertical, Minus, Plus } from 'lucide-react';

export default function CartSheet() {
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
        <div className="max-h-full h-auto flex flex-col gap-2 shadow-xs">
          <CartItem />
          <Separator />
          <CartItem />
        </div>
        <div className="h-full bg-[#f5f5f5]"></div>
      </div>
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-6 bg-white gap-4 shadow-3xl">
        <span className="flex justify-between text-[14px] font-bold">
          <span>Tạm tính</span>
          <span>{formatMoney(10000230)} VNĐ</span>
        </span>
        <button className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold!">
          THANH TOÁN
        </button>
      </div>
    </div>
  );
}
function CartItem() {
  return (
    <div className="flex gap-5 p-5 pt-2 pb-2 ">
      <div className="flex items-center">
        <Checkbox />
      </div>

      <img
        className="w-20 h-auto rounded-1"
        src={'https://picsum.photos/id/237/200/300'}
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <span className={reusableStyle.cartName}>Áo khoác active nam</span>
          <span className={reusableStyle.cartSubInfo}>
            <img /> Đen SK010 | XL
          </span>
        </div>

        <span className={reusableStyle.cartPrice}>
          {formatMoney(799000)} VNĐ
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
          1
          <Button className={reusableStyle.button} variant={'outline'}>
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
  cartName: 'text-[#333f48] text-[13px] font-medium leading-5 text-black',
  cartSubInfo: ' text-[12px] font-medium leading-5 text-muted-foreground',
  button: 'w-7 h-7 rounded-full p-0 items-center justify-center',
};
