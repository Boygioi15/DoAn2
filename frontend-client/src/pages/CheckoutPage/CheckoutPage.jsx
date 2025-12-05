import { Button } from '@/components/ui/button';
import { CreditCard, Undo2 } from 'lucide-react';
import { HiArrowLongRight } from 'react-icons/hi2';
import AnonymousBlock from './AnonymousBlock';
import ItemListBlock from './ItemListBlock';
import CouponBlock from './CouponBlock';
import CashoutBlock from './CashoutBlock';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import codPNG from '@/assets/cod.png';
import momoPNG from '@/assets/momo.png';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  return (
    <div className="grid grid-cols-[6fr_4fr] p-25 gap-10 text-[14px] text-(--color-preset-gray) font-medium leading-5 bg-[#f5f5f5]">
      <TopLayout />
      <div className="flex flex-col gap-10 mt-5">
        <AnonymousBlock />
        <ItemListBlock />
      </div>
      <div className="flex flex-col gap-10 mt-5">
        <CouponBlock />
        <PaymentMethodBlock />
        <CashoutBlock />
      </div>
    </div>
  );
}
function TopLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex fixed top-0 left-0 right-0 justify-between bg-white shadow-xl p-2 pl-20 pr-20">
      <div className="title cursor-pointer" onClick={() => navigate('/')}>
        Q-Shop
      </div>
      <TransactionProgress state={2} />
      <Button
        variant="ghost"
        className="text-[14px] font-bold flex items-center w-fit! mt-2"
        onClick={() => navigate('/')}
      >
        <Undo2 style={{ width: '20px', height: '20px' }} /> TIẾP TỤC MUA SẮM
      </Button>
    </div>
  );
}
function PaymentMethodBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>
        <CreditCard /> Phương thức thanh toán
      </span>
      <RadioGroup defaultValue="cod">
        <div
          className={
            'cursor-pointer flex items-center gap-2 border border-[#bdc7d4] rounded-[4px] p-2' +
            ' border-black'
          }
        >
          <RadioGroupItem value="cod" className={'cursor-pointer w-5! h-5!'} />
          <img src={codPNG} className="w-9 h-9 p-" />
          <span> Thanh toán khi nhận hàng (COD)</span>
        </div>
        <div className=" cursor-pointer flex items-center gap-2 border border-[#bdc7d4] rounded-[4px] p-2">
          <RadioGroupItem value="momo" className={'cursor-pointer w-5! h-5!'} />
          <img src={momoPNG} className="w-9 h-9" />
          <span> Cổng thanh toán Momo</span>
        </div>
      </RadioGroup>
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
          (state >= 3 && reuseableStyle.progressArrowMarked)
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
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-6 mb-4',
};
