import { ChevronRight, Ticket } from 'lucide-react';

export default function CouponBlock() {
  return (
    <div className={reuseableStyle.block}>
      <span
        className={reuseableStyle.blockTitle + ' justify-between items-center'}
      >
        <span className="flex items-center gap-2">
          {' '}
          <Ticket /> Mã ưu đãi
        </span>

        <span className="flex items-center gap-2 font-medium text-(--color-preset-gray)">
          {' '}
          Chọn hoặc nhập mã <ChevronRight />
        </span>
      </span>
    </div>
  );
}

const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-4',
};
