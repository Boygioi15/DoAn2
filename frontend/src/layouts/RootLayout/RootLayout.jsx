import { Outlet, Link, useNavigate } from 'react-router-dom';
import './RootLayout.css';
import ModalContextProvider, {
  ModalContext,
} from '../../contexts/ModalContext';
import { useContext, useState } from 'react';
import UltilityContextProvider_1 from '../../contexts/UltilityContext_1';
import { UltilityContext_1 } from '../../contexts/UltilityContext_1';
export default function RootLayout({ children }) {
  return (
    <ModalContextProvider>
      <UltilityContextProvider_1>
        <div>
          <TopLayout />
          {children}
          <Outlet />
          <BotLayout />
        </div>
      </UltilityContextProvider_1>
    </ModalContextProvider>
  );
}

import topBannerSample from '../../assets/topBannerSample.webp';
import { FiSearch } from 'react-icons/fi';
import { IoLogInOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle, MdAccountCircle } from 'react-icons/md';
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';

import useAuthStore from '../../contexts/zustands/AuthStore';

export function TopLayout() {
  const { openModal } = useContext(ModalContext);
  const { handleUnauthorizedAction } = useContext(UltilityContext_1);
  const navigate = useNavigate();
  //get img and link of top banner from be

  //check login state with refresh token
  const authStore = useAuthStore.getState();
  let loggedIn = false;
  loggedIn = !!authStore.refreshToken;
  return (
    <div className="TopLayout">
      <Link className="TopLayout_TopBanner">
        <img src={topBannerSample} />
      </Link>
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
                navigate('/auth');
              }}
            />
          ) : (
            <IconBlock
              icon={<Fa style={{ fontSize: '28px' }} />}
              name={'Tài khoản'}
              handleOnClick={() => {
                navigate('/profile');
              }}
            />
          )}
          <IconBlock
            icon={<FiShoppingBag style={{ fontSize: '28px' }} />}
            name={'Giỏ hàng'}
          />
        </div>
      </div>
      <h1>This is the root layout!</h1>

      <div>
        <Link to="/auth/sign-in">Sign in/ Sign up</Link>
      </div>
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
