import { Button } from '@/components/ui/button';
import { CreditCard, Mail, Undo2 } from 'lucide-react';
import { HiArrowLongRight } from 'react-icons/hi2';
import AnonymousAddressBlock from './AnonymousAddressBlock';
import ItemListBlock from './ItemListBlock';
import CouponBlock from './CouponBlock';
import CashoutBlock from './CashoutBlock';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import codPNG from '@/assets/cod.png';
import momoPNG from '@/assets/momo.png';
import payosPNG from '@/assets/payos.png';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';
import { anonymousTransactionApi, transactionApi } from '@/api/transactionApi';
import useAuthStore from '@/contexts/zustands/AuthStore';
import useCartStore from '@/contexts/zustands/CartStore';
import SpinnerOverlay from '@/reusable_components/SpinnerOverlay';
import { toast } from 'sonner';
import UserAddressBlock from './UserAddressBlock';
import UltilityContextProvider_1, {
  UltilityContext_1,
} from '@/contexts/UltilityContext_1';
import ModalContextProvider from '@/contexts/ModalContext';
import { Input } from '@/components/ui/input';
import userApi from '@/api/userApi';

const initAddress = {
  contact_name: 'Anh Quyền',
  contact_phone: '0373865627',
  address_detail: '329 đường Hải Đức',
  provinceCode: '',
  provinceName: '',
  districtCode: '',
  districtName: '',
  wardCode: '',
  wardName: '',
};
const initFormError = {
  AnonymousAddressBlockError: [],
};
export default function CheckoutPageWrapper() {
  return (
    <ModalContextProvider>
      <UltilityContextProvider_1>
        <CheckoutPage />
      </UltilityContextProvider_1>
    </ModalContextProvider>
  );
}
export const CheckoutPageContext = createContext();
function CheckoutPage() {
  const { convenience_1 } = useContext(UltilityContext_1);
  const authStore = useAuthStore.getState();
  const [loading, setLoading] = useState(false);

  const [cartItemList, setCartItemList] = useState(null);
  const [defaultAmount, setDefaultAmount] = useState(null);
  const [cashoutAmount, setCashoutAmount] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [anonymousUserAddress, setAnonymousUserAddress] = useState(initAddress);
  const [email, setEmail] = useState('boygioi85@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formError, setFormError] = useState(initFormError);
  const [submitLoading, setSubmitLoading] = useState(false);

  const cartId = useCartStore((s) => s.cartId);
  const getUserInfo = async () => {
    try {
      const result = await userApi.getAccountInfo();
      if (email.trim().length === 0) {
        setEmail(result.data.accountInfo.email);
      }
    } catch (error) {}
  };
  const getAndUpdateCartTransactionData = async () => {
    try {
      setLoading(true);
      const token = useAuthStore.getState().accessToken;
      const cartId = useCartStore.getState().cartId;
      let response;
      if (token) {
        response = await transactionApi.getTransactionDetailAndUpdateCart();
      } else {
        response =
          await anonymousTransactionApi.getTransactionDetailAndUpdateCart(
            cartId
          );
      }
      setCartItemList(response.data.cartItemList);
      setDefaultAmount(response.data.defaultAmount);
      setCashoutAmount(response.data.cashoutAmount);
    } catch (error) {
      if (error.authError) {
        convenience_1();
      }
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu thanh toán');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (authStore.accessToken) {
      getUserInfo();
    }
    getAndUpdateCartTransactionData();
  }, []);

  const [allowedToSubmit, setAllowedToSubmit] = useState(false);

  const formFormData = () => {
    let addressInfo;
    if (!authStore.accessToken) {
      const t = anonymousUserAddress;
      addressInfo = {
        address_name: t.contact_name,
        address_phone: t.contact_phone,
        address_province_code: t.provinceCode,
        address_province_name: t.provinceName,
        address_district_code: t.districtCode,
        address_district_name: t.districtName,
        address_ward_code: t.wardCode,
        address_ward_name: t.wardName,
        address_detail: t.address_detail,
      };
      // console.log('ANO A: ', anonymousUserAddress);
    } else {
      const t = userAddress;
      addressInfo = {
        address_name: t.contact_name,
        address_phone: t.contact_phone,
        address_province_code: t.province_detail.provinceCode,
        address_province_name: t.province_detail.provinceName,
        address_district_code: t.province_detail.districtCode,
        address_district_name: t.province_detail.districtName,
        address_ward_code: t.province_detail.wardCode,
        address_ward_name: t.province_detail.wardName,
        address_detail: t.address_detail,
        reference_address: t.addressId,
      };
      // console.log('UA: ', userAddress);
    }
    console.log('AI: ', addressInfo);

    let _cartItemList = cartItemList.map((cartItem) => ({
      cartItemId: cartItem.cartItemId,
      quantity: cartItem.quantity,
      unitPrice: cartItem.unitPrice,
      cashoutPrice: cartItem.unitPrice * cartItem.quantity,

      productId: cartItem.productId,
      variantId: cartItem.variantId,

      product_name: cartItem.product_name,
      product_thumbnail: cartItem.product_thumbnail,
      product_sku: cartItem.product_sku,

      variant_thumbnail: cartItem.variant_thumbnail,
      variant_color: cartItem.variant_color,
      variant_size: cartItem.variant_size,
      variant_sku: cartItem.variant_sku,
    }));

    const paymentDetail = {
      payment_method: paymentMethod,
      payment_default_price: defaultAmount,
      payment_cashout_price: cashoutAmount,
    };
    const redirectUrl = window.location.origin + '/order';
    return {
      email,
      addressInfo,
      cartItemList: _cartItemList,
      paymentDetail,
      redirectUrl,
    };
  };
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const formData = formFormData();
      let result;
      if (authStore.accessToken) {
        result = await transactionApi.beginTransaction(formData);
      } else {
        formData.cartId = cartId;
        result = await anonymousTransactionApi.beginTransaction(formData);
      }
      window.location.href = result.data.checkoutUrl;
    } catch (error) {
      if (error.authError) {
        convenience_1();
      }
      console.log(error);
      toast.error('Có lỗi khi khởi tạo giao dịch');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!cartItemList) return;
  return (
    <CheckoutPageContext.Provider value={{ getAndUpdateCartTransactionData }}>
      <div className="overflow-scroll h-screen grid grid-cols-[6fr_4fr] p-25 gap-10 text-[14px] text-(--color-preset-gray) font-medium leading-5 bg-[#f5f5f5]">
        {loading && <SpinnerOverlay />}
        <TopLayout />
        <div className="flex flex-col gap-6 mt-5">
          {authStore.accessToken ? (
            <UserAddressBlock
              setAddress={setUserAddress}
              address={userAddress}
            />
          ) : (
            <AnonymousAddressBlock
              address={anonymousUserAddress}
              setAddress={setAnonymousUserAddress}
              formError={formError}
              setFormError={setFormError}
            />
          )}
          <div className={reuseableStyle.block}>
            <span className={reuseableStyle.blockTitle}>
              <Mail />
              Email thanh toán
            </span>
            <input
              className="input-standard-1"
              value={email}
              placeholder={'Nhập email thanh toán'}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <ItemListBlock cartItemList={cartItemList} />
        </div>
        <div className="flex flex-col gap-10 mt-5">
          <CouponBlock />
          <PaymentMethodBlock
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
          <CashoutBlock
            defaultAmount={defaultAmount}
            cashoutAmount={cashoutAmount}
            onCashoutSubmit={handleSubmit}
            submitLoading={submitLoading}
          />
        </div>
      </div>
    </CheckoutPageContext.Provider>
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
function PaymentMethodBlock({ paymentMethod, setPaymentMethod }) {
  return (
    <div className={reuseableStyle.block}>
      <span className={reuseableStyle.blockTitle}>
        <CreditCard /> Phương thức thanh toán
      </span>
      <RadioGroup value={paymentMethod}>
        <div
          className={
            'cursor-pointer flex items-center gap-2 border border-[#bdc7d4] rounded-[4px] p-2 ' +
            (paymentMethod === 'cod' && ' border-black')
          }
          onClick={() => setPaymentMethod('cod')}
        >
          <RadioGroupItem value="cod" className={'cursor-pointer w-5! h-5!'} />
          <img src={codPNG} className="w-9 h-9 p-" />
          <span> Thanh toán khi nhận hàng (COD)</span>
        </div>
        <div
          className={
            'cursor-pointer flex items-center gap-2 border border-[#bdc7d4] rounded-[4px] p-2 ' +
            (paymentMethod === 'payos' && ' border-black')
          }
          onClick={() => setPaymentMethod('payos')}
        >
          <RadioGroupItem
            value="payos"
            className={'cursor-pointer w-5! h-5!'}
          />
          <img src={payosPNG} className="w-9 h-9 p-" />
          <span> Cổng thanh toán PayOS</span>
        </div>
        <div
          className={
            ' cursor-pointer flex items-center gap-2 border border-[#bdc7d4] rounded-[4px] p-2 ' +
            (paymentMethod === 'momo' && ' border-black')
          }
          onClick={() => setPaymentMethod('momo')}
        >
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
