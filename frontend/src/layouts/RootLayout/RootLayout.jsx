import { Outlet, Link } from 'react-router-dom';
import './RootLayout.css';
export default function RootLayout({ children }) {
  return (
    <div>
      <TopLayout />
      {children}
      <Outlet />
      <BotLayout />
    </div>
  );
}
export function TopLayout() {
  return (
    <div className="TopLayout">
      <h1>This is the root layout!</h1>
      <div>
        <Link to="/profile">Profile</Link>
      </div>
      <div>
        <Link to="/auth/sign-in">Sign in/ Sign up</Link>
      </div>
    </div>
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
