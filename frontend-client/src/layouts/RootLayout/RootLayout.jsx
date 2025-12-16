import { Outlet, Link, useNavigate } from 'react-router-dom';
import './RootLayout.css';
import ModalContextProvider, {
  ModalContext,
} from '../../contexts/ModalContext';
import { createContext, useContext, useEffect, useState } from 'react';
import UltilityContextProvider_1 from '../../contexts/UltilityContext_1';
import { UltilityContext_1 } from '../../contexts/UltilityContext_1';
import topBannerSample from '../../assets/topBannerSample.webp';
import { FiSearch } from 'react-icons/fi';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';

import useAuthStore from '../../contexts/zustands/AuthStore';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Breadcrumbs from '@/reusable_components/Breadcrumb';
import { frontendApi } from '@/api/frontendApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowDownToLine,
  CircleUserRound,
  Headset,
  MessageCircle,
  User,
} from 'lucide-react';
import { CartWrapper } from './CartComponent';
export default function RootLayout({ children }) {
  return (
    <ModalContextProvider>
      <UltilityContextProvider_1>
        <div className="relative">
          <TopLayout />
          <Breadcrumbs />
          {children}
          <Outlet />
          <div className="fixed bottom-10 right-7 flex flex-col gap-5">
            <Button
              className={
                'rounded-full w-[60px] h-[60px] bg-(--color-preset-gray) hover:bg-(--color-preset-gray) cursor-pointer'
              }
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <MessageCircle
                className="w-[28px]! h-[28px]! text-white"
                fill="white"
              />
            </Button>
            <Button
              className={
                'rounded-full w-[60px] h-[60px] bg-[#edf1f5] hover:bg-[#edf1f5] cursor-pointer'
              }
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowDownToLine className="rotate-180 w-[24px]! h-[24px]! text-black" />
            </Button>
          </div>

          <BotLayout />
        </div>
      </UltilityContextProvider_1>
    </ModalContextProvider>
  );
}

export function TopLayout() {
  const { openModal } = useContext(ModalContext);
  const { convenience_1 } = useContext(UltilityContext_1);
  const navigate = useNavigate();
  //get img and link of top banner from be

  //check login state with refresh token
  const authStore = useAuthStore.getState();
  let loggedIn = false;
  loggedIn = !!authStore.refreshToken;

  const [search, setSearch] = useState('');
  return (
    <div className="TopLayout">
      <TopLayout_TopBanner />
      <TopLayout_MessageRotator />
      <div className="TopLayout_Toolbar">
        <div className="title cursor-pointer" onClick={() => navigate('/')}>
          Q-Shop
        </div>
        <div className="TopLayout_Toolbar_Right">
          <div className="input-with-icon-before">
            <FiSearch style={{ fontSize: '24px' }} />
            <input
              placeholder="Tìm kiếm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?query=${encodeURIComponent(search)}`);
                }
              }}
            />
          </div>
          {!loggedIn ? (
            <Button
              variant={'ghost'}
              className={
                'flex flex-col gap-1 h-full p-1! items-center justify-center'
              }
              onClick={() => {
                navigate('/auth/sign-in');
              }}
            >
              <CircleUserRound style={{ width: '24px', height: '24px' }} />
              <span className="text-[14px] font-medium">Đăng nhập</span>
            </Button>
          ) : (
            <Button
              variant={'ghost'}
              className={
                'flex flex-col gap-1 h-full p-1! items-center justify-center'
              }
              onClick={() => {
                navigate('/profile/account-info');
              }}
            >
              <User style={{ width: '24px', height: '24px' }} />
              <span className="text-[14px] font-medium">Tài khoản</span>
            </Button>
          )}
          <CartWrapper />
          <Button
            variant={'ghost'}
            className={
              'flex flex-col gap-1 h-full p-1! items-center justify-center'
            }
          >
            <Headset style={{ width: '24px', height: '24px' }} />
            <span className="text-[14px] font-medium">Liên hệ</span>
          </Button>
        </div>
      </div>
      <TopLayout_CategorySelector />
    </div>
  );
}
function TopLayout_TopBanner() {
  return (
    <Link className="TopLayout_TopBanner">
      <img src={topBannerSample} />
    </Link>
  );
}
function TopLayout_MessageRotator() {
  const [message, setMessage] = useState([
    'Ưu đãi ngập tràn',
    'Quà hấp dẫn',
    'Ôi trời ơi',
  ]);
  const getMessage = async () => {
    try {
      const response = await frontendApi.getTopLayoutRotatorMessage();
      setMessage(response.data);
    } catch (error) {
      toast.error('Có lỗi khi lấy dữ liệu toplayout-message-rotator');
    }
  };
  useEffect(() => {
    getMessage();
  }, []);
  const [messageIndex, setMessageIndex] = useState(1);
  const [slideClass, setSlideClass] = useState('');
  const [slideDirection, setSlideDirection] = useState('next');
  const handleMessageIndex = (state) => {
    setSlideDirection(state ? 'next' : 'prev');
    setSlideClass('slide-out');

    setTimeout(() => {
      setMessageIndex((prev) =>
        state
          ? (prev + 1) % message.length
          : (prev - 1 + message.length) % message.length
      );
      setSlideClass('slide-in');
    }, 300);
  };
  //auto move forward for message
  useEffect(() => {
    const interval = setInterval(() => {
      handleMessageIndex(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [message, messageIndex]);

  // Reset class after animation
  useEffect(() => {
    const timer = setTimeout(() => setSlideClass(''), 300);
    return () => clearTimeout(timer);
  }, [messageIndex]);
  return (
    <div className="TopLayout_Message">
      <MdArrowBackIos
        className="hover-icon"
        onClick={() => {
          handleMessageIndex(false);
        }}
      />
      <div style={{ width: '500px' }}></div>
      <div className={`message-text ${slideClass} ${slideDirection}`}>
        {message[messageIndex]}
      </div>

      <MdArrowForwardIos
        className="hover-icon"
        onClick={() => {
          handleMessageIndex(true);
        }}
      />
    </div>
  );
}
function TopLayout_CategorySelector() {
  const [categoryData, setCategoryData] = useState([]);
  const getCategoryData = async () => {
    try {
      const response = await frontendApi.getCategoryData();
      setCategoryData(response.data);
    } catch (error) {
      toast.error('Có lỗi khi lấy dữ liệu ngành hàng');
    }
  };
  useEffect(() => {
    getCategoryData();
  }, []);
  if (!categoryData) return;
  return (
    <div className="flex w-full bg-(--color-preset-gray) pl-25 pr-25 relative">
      {categoryData.map((t1) => (
        <div className="group" key={t1.name}>
          <button className="category-button">{t1.name}</button>
          <div
            className="
              absolute left-0 z-100
              hidden group-hover:block
              bg-white shadow-lg border pl-25 pr-25 pt-10 pb-10
              w-screen 
            "
          >
            {t1.subCategory?.length > 0 ? (
              <div className="flex gap-2">
                <div className="flex flex-col gap-2">
                  <Link className={reusableStyle.categoryLink}>
                    Sản phẩm mới
                  </Link>
                  <Link className={reusableStyle.categoryLink}>Giá tốt</Link>
                  <Link className={reusableStyle.categoryLink}>Free ship</Link>
                </div>
                <div className="w-px bg-gray-300"></div>
                <div className="flex flex-col ml-5 gap-2">
                  <h3>Danh mục sản phẩm</h3>
                  <div className="flex flex-col flex-wrap max-h-[200px] gap-2">
                    {t1.subCategory.map((t2) => (
                      <Link
                        className={reusableStyle.categoryLink}
                        key={t2.categoryId}
                        to={`/category/${t1.categoryId}/${t2.categoryId}`}
                      >
                        {t2.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Không có danh mục con</div>
            )}
          </div>
        </div>
      ))}
      <button className="category-button">Sản phẩm mới</button>
      <button className="category-button">Free ship</button>
    </div>
  );
}
function IconBlock({ icon, name, handleOnClick, note }) {
  return (
    <button className="icon-block" onClick={handleOnClick}>
      {icon}
      <div>{name}</div>
    </button>
  );
}
export function BotLayout() {
  return (
    <div className="BotLayout">
      <div className="BotLayout_Title">Trường đại học CNTT UIT - Khoa CNPM</div>
      <div className="BotLayout_Content">
        <div className="BotLayout_SmallText">
          Địa chỉ: Khu phố 6 - phường Linh Trung <br />
          SĐT: 0123-456-789 <br />
          Email: uit@uit.edu.vn
        </div>
        <div className="BotLayout_SmallText">
          <div className="BotLayout_SmallTitle">
            <b>Q-Shop</b>
          </div>
          <Link
            className="BotLayout_SmallText BotLayout_HoverText"
            to="/about-us"
          >
            <b>Giới thiệu</b>
          </Link>
          <Link className="BotLayout_SmallText BotLayout_HoverText" to="/news">
            <b>Tin tức</b>
          </Link>
        </div>
        <div className="BotLayout_SmallText">
          <div className="BotLayout_SmallTitle">
            <b>Hỗ trợ</b>
          </div>
          <Link className="BotLayout_SmallText BotLayout_HoverText" to="/f-a-q">
            <b>Hỏi đáp</b>
          </Link>
          <Link
            className="BotLayout_SmallText BotLayout_HoverText"
            to="/terms-and-conditions"
          >
            <b>Điều kiện & chính sách</b>
          </Link>
        </div>
      </div>
    </div>
  );
}

const reusableStyle = {
  categoryLink:
    'p-2 font-medium text-(color-preset-gray) hover:text-red-500 cursor-pointer min-w-[200px]',
};
