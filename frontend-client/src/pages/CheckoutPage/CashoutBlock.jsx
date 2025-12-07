import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/util';
import { ChevronRight, ClipboardCheck, Ticket } from 'lucide-react';

export default function CashoutBlock({
  defaultAmount,
  cashoutAmount,
  onCashoutSubmit,
}) {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>
        <ClipboardCheck /> Chi tiết đơn hàng
      </span>
      <div className="grid grid-cols-[6fr_4fr] gap-2 text-[14px] font-medium">
        <span>Giá trị đơn hàng</span>
        <span className="justify-self-end">
          {formatMoney(defaultAmount)} VNĐ
        </span>
        <span>Giảm giá trực tiếp</span>
        <span className={'text-red-500' + ' justify-self-end'}>
          -{formatMoney(cashoutAmount - defaultAmount)} VNĐ
        </span>
        <span>Phí vận chuyển</span>
        <span className="justify-self-end">
          {formatMoney(cashoutAmount)} VNĐ
        </span>
        <Separator className={'col-span-2 mt-2 mb-2'} />
        <span className={reuseableStyle.blockTitle}>Tổng tiền thanh toán</span>
        <span className={reuseableStyle.blockTitle + ' justify-self-end'}>
          {formatMoney(cashoutAmount)} VNĐ
        </span>
        <span className={'text-[12px] text-muted-foreground -mt-4'}>
          (Đã bao gồm thuế VAT)
        </span>
        <span
          className={'text-[12px] text-red-500' + ' justify-self-end -mt-4'}
        >
          Tiết kiệm {formatMoney(cashoutAmount - defaultAmount)} VNĐ
        </span>
      </div>
      <button
        className="button-standard-1 bg-[#da291c]! text-[14px]! font-bold! mt-4"
        onClick={onCashoutSubmit}
      >
        THANH TOÁN
      </button>
    </div>
  );
}

const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-4 mb-4',
};
