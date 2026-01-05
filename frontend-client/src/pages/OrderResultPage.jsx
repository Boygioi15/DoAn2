import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Check, Undo2, AlertCircle, HelpCircle } from 'lucide-react'; // Optional, but we use a custom SVG for animation below
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiArrowLongRight } from 'react-icons/hi2';
import orderRejected from '@/assets/order_rejected.webp';
import { transactionApi } from '@/api/transactionApi';

export default function OrderPageWrapper() {
  const [searchParam, setSearchParam] = useSearchParams();
  const cancel = useMemo(() => searchParam.get('cancel'));
  const orderId = useMemo(() => searchParam.get('orderId1'));
  const cancelOrder = async () => {
    if (cancel === 'true') {
      try {
        const result = await transactionApi.cancelOrder(orderId);
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    if (cancel === 'true') {
      cancelOrder();
    }
  }, [searchParam]);

  if (!cancel || cancel === 'false') return <OrderSuccessPage />;
  return <OrderFailedPage />;
}
function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  // --- Confetti Logic ---
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Cannon from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Cannon from right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 
        Custom Styles for the Checkmark Animation 
        (Tailwind doesn't handle complex SVG stroke animations natively)
      */}
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 50px #4bb71b; }
        }
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #4bb71b;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff;
          stroke-miterlimit: 10;
          margin: 0 auto;
          box-shadow: inset 0px 0px 0px #4bb71b;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
      `}</style>
      <TopLayout />
      <Card className="w-full max-w-md shadow-xl border-0 mt-15">
        <CardContent className="pt-4 pb-8 flex flex-col items-center text-center">
          {/* Animated Checkmark */}
          <div className="mb-6 relative">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thành công
          </CardTitle>

          <p className="text-gray-500 mb-6 max-w-xs mx-auto leading-5">
            Cảm ơn bạn đã đồng hành và tin tưởng Silk shop. Đơn hàng của bạn
            đang được xử lý!
          </p>

          {/* Order Details Summary (Optional) */}
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-2 border border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-medium text-gray-900">
                #{searchParams.get('orderId1')}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8">
          {/* Primary Action - Shopee Orange */}
          <Button
            className="w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold h-11 text-md shadow-md transition-all hover:shadow-lg"
            onClick={() => (window.location.href = '/')}
          >
            Tiếp tục mua sắm
          </Button>

          {/* Secondary Action */}
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 h-11"
            onClick={() => (window.location.href = '/orders')}
          >
            Xem chi tiết đơn hàng
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function OrderFailedPage() {
  const [searchParams] = useSearchParams();
  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 
        Custom Styles for the Red 'X' Animation 
      */}
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill-error {
          100% { box-shadow: inset 0px 0px 0px 50px #ef4444; }
        }
        .cross-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #ef4444;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .cross-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff;
          stroke-miterlimit: 10;
          margin: 0 auto;
          box-shadow: inset 0px 0px 0px #ef4444;
          animation: fill-error .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .cross-line {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
      `}</style>
      <TopLayout />
      <Card className="w-full max-w-md shadow-xl border-0 mt-15 z-0">
        <CardContent className="pt-2 pb-2 flex flex-col items-center text-center">
          {/* Animated Red 'X' */}
          <div className="mb-6 relative">
            <svg
              className="cross-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="cross-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path className="cross-line" fill="none" d="M16 16 36 36" />
              <path className="cross-line" fill="none" d="M36 16 16 36" />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thất bại
          </CardTitle>

          <p className="text-gray-500 mb-6 max-w-xs mx-auto leading-5">
            Rất tiếc, giao dịch không thể thực hiện. Vui lòng kiểm tra lại thông
            tin hoặc thử phương thức thanh toán khác.
          </p>

          {/* Error Details Box */}
          <div className="w-full bg-red-50 rounded-lg p-4 mb-2 border border-red-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span className="font-medium text-gray-900">
                #{searchParams.get('orderId1')}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center pt-2 border-t border-red-200 mt-2">
              <span className="text-red-600 flex items-center gap-1">
                <AlertCircle size={14} /> Lý do
              </span>
              <span className="font-medium text-red-600">Lỗi hệ thống</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-4">
          {/* Primary Action - Retry (Shopee Orange) */}
          <Button
            className="w-full bg-[#ee4d2d] hover:bg-[#d73211] text-white font-semibold h-11 text-md shadow-md transition-all hover:shadow-lg"
            onClick={() => window.location.reload()} // Or redirect to payment URL
          >
            Thử lại / Thanh toán lại
          </Button>

          {/* Secondary Action - Back to Home */}
          <Button
            variant="outline"
            className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 h-11"
            onClick={() => (window.location.href = '/')}
          >
            Quay về trang chủ
          </Button>

          {/* Help Link */}
          <div className="mt-4 text-sm text-gray-400 flex items-center gap-1 cursor-pointer hover:text-gray-600 transition-colors">
            <HelpCircle size={14} />
            <span>Cần hỗ trợ? Liên hệ CSKH</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
function TopLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex fixed top-0 left-0 right-0 justify-between bg-white shadow-xl p-2 pl-20 pr-20 z-10">
      <div
        className="bg-(--color-preset-red) flex justify-center items-center cursor-pointer text-white text-[24px] font-bold px-3"
        onClick={() => navigate('/')}
      >
        SilkShop
      </div>
      <TransactionProgress state={3} />
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
        <div className={`${state >= 3 && reuseableStyle.progressTextMarked}`}>
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
