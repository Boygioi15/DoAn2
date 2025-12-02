import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/util';
import { EllipsisVertical, Minus, Plus } from 'lucide-react';

export default function CartSheet() {
  return (
    <div className="flex flex-col p-6 relative h-[95vh]">
      <h2 className="text-[16px] font-bold leading-6 pb-5">Giỏ hàng</h2>
      <Separator />
      <div className="flex flex-col gap-2 p-4">
        <CartItem />
        <Separator />
        <CartItem />
      </div>
      <div className="flex flex-col absolute bottom-0 w-full">
        <span className="flex justify-between text-[14px] font-bold w-full">
          <span>Tạm tính</span>
          <span>{formatMoney(10000230)} VNĐ</span>
        </span>
        <button className="button-standard-1">THANH TOÁN</button>
      </div>
    </div>
  );
}
function CartItem() {
  return (
    <div className="flex gap-4">
      <div className="flex items-center">
        <Checkbox />
      </div>

      <img
        className="w-20 h-auto"
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
        <Button className={reusableStyle.button} variant={'outline'}>
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
  cartName: 'text-[#333f48] text-[12px] font-medium leading-5',
  cartSubInfo: ' text-[12px] font-medium leading-5 text-muted-foreground',
  button: 'w-7 h-7 rounded-full p-0 items-center justify-center',
};
