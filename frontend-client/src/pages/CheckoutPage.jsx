import { Button } from '@/components/ui/button';
import { OrBlock } from '@/reusable_components/comps';
import { ShieldXIcon, Ticket, Undo2 } from 'lucide-react';
import { HiArrowLongRight } from 'react-icons/hi2';

export default function CheckoutPage() {
  return (
    <div className="grid grid-cols-[6fr_4fr] p-20 gap-10 text-[14px] font-medium leading-5 bg-[#f5f5f5]">
      <TopLayout />
      <div className="flex flex-col gap-10 mt-5">
        <AnonymousBlock />
        <ItemListBlock />
      </div>
      <div className="flex flex-col gap-10 mt-5">
        <CouponBlock />
        <CashoutBlock />
      </div>
    </div>
  );
}
function TopLayout() {
  return (
    <div className="flex fixed top-0 left-0 right-0 justify-between bg-white shadow-xl p-2 pl-20 pr-20">
      <div className="title cursor-pointer" onClick={() => navigate('/')}>
        Q-Shop
      </div>
      <TransactionProgress state={2} />
      <Button
        variant="ghost"
        className="text-[14px] font-bold flex items-center w-fit! mt-1"
      >
        <Undo2 style={{ width: '20px', height: '20px' }} /> TIẾP TỤC MUA SẮM
      </Button>
    </div>
  );
}
function AnonymousBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>Đăng nhập/ Đăng ký</span>
      <div className="grid grid-cols-[7fr_3fr] ">
        <div className="flex flex-col gap-2 mb-5">
          <span>
            Đăng nhập/ Đăng ký để nhận ưu đãi giảm giá thành viên đến 20%
          </span>
          <Button className="w-fit bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">
            <Ticket />
            Giảm 80K cho lần mua sắm đầu tiên
          </Button>
        </div>

        <Button className="text-[14px] font-bold text-white rounded-none! p-6! pl-4! pr-4!">
          ĐĂNG NHẬP/ ĐĂNG KÝ
        </Button>
      </div>
      <OrBlock />
      <span className={reuseableStyle.blockTitle}>
        Mua hàng không đăng nhập
      </span>
    </div>
  );
}
function ItemListBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>Sản phẩm</span>
    </div>
  );
}
function CouponBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>Ưu đãi</span>
    </div>
  );
}
function CashoutBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>Chi tiết đơn hàng</span>
    </div>
  );
}

function TransactionProgress({ state }) {
  return (
    <div className="flex w-fit gap-2 text-[14px] font-medium items-center">
      <div className={reuseableStyle.progressBlock}>
        <div
          className={
            reuseableStyle.progressCircle +
            (state >= 1 && reuseableStyle.progressCircleMarked)
          }
        >
          1
        </div>
        <div className={state >= 1 && reuseableStyle.progressTextMarked}>
          Giỏ hàng
        </div>
      </div>

      <HiArrowLongRight
        className={
          reuseableStyle.progressArrow +
          (state >= 1 && reuseableStyle.progressArrowMarked)
        }
      />
      {/* 2*/}
      <div className={reuseableStyle.progressBlock}>
        <div
          className={
            reuseableStyle.progressCircle +
            (state >= 2 && reuseableStyle.progressCircleMarked)
          }
        >
          2
        </div>
        <div className={state >= 2 && reuseableStyle.progressTextMarked}>
          Thanh toán
        </div>
      </div>

      <HiArrowLongRight
        className={
          reuseableStyle.progressArrow +
          (state >= 2 && reuseableStyle.progressArrowMarked)
        }
      />

      {/* 3 */}
      <div className={reuseableStyle.progressBlock}>
        <div
          className={
            reuseableStyle.progressCircle +
            (state >= 3 && reuseableStyle.progressCircleMarked)
          }
        >
          3
        </div>
        <div className={state >= 3 && reuseableStyle.progressTextMarked}>
          Hoàn tất
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
  blockTitle: 'text-[16px] font-bold leading-6 mb-4',
};
