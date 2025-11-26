import { Outlet, Link, useNavigate } from 'react-router-dom';
import './RootLayout.css';
import ModalContextProvider, {
  ModalContext,
} from '../../contexts/ModalContext';
import { useContext, useEffect, useState } from 'react';
import UltilityContextProvider_1 from '../../contexts/UltilityContext_1';
import { UltilityContext_1 } from '../../contexts/UltilityContext_1';
import topBannerSample from '../../assets/topBannerSample.webp';
import { FiSearch } from 'react-icons/fi';
import { IoLogInOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle, MdAccountCircle } from 'react-icons/md';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';

import useAuthStore from '../../contexts/zustands/AuthStore';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Breadcrumbs from '@/reusable_components/Breadcrumb';
import { frontendApi } from '@/api/frontendApi';
import { Button } from '@/components/ui/button';
export default function RootLayout({ children }) {
  return (
    <ModalContextProvider>
      <UltilityContextProvider_1>
        <div>
          <TopLayout />
          <Breadcrumbs />
          {children}
          <Outlet />
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
  return (
    <div className="TopLayout">
      <TopLayout_TopBanner />
      <TopLayout_MessageRotator />
      <div className="TopLayout_Toolbar">
        <div style={{}} className="title">
          Q-Shop
        </div>
        <div className="TopLayout_Toolbar_Right">
          <div className="input-with-icon-before">
            <FiSearch style={{ fontSize: '24px' }} />
            <input placeholder="Tìm kiếm" />
          </div>
          {!loggedIn ? (
            <IconBlock
              icon={<FaRegUserCircle style={{ fontSize: '28px' }} />}
              name={'Đăng nhập'}
              handleOnClick={() => {
                navigate('/auth/sign-in');
              }}
            />
          ) : (
            <IconBlock
              icon={<FaUserCircle style={{ fontSize: '28px' }} />}
              name={'Tài khoản'}
              handleOnClick={() => {
                navigate('/profile/account-info');
              }}
            />
          )}
          <IconBlock
            icon={<FiShoppingBag style={{ fontSize: '28px' }} />}
            name={'Giỏ hàng'}
          />
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
        <div className="group">
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
                      <Link className={reusableStyle.categoryLink}>
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
