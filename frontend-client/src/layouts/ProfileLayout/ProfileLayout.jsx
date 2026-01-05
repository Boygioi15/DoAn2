import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ProfileContext } from '../../contexts/ProfileContext';
import './ProfileLayout.css';
export default function ProfileLayout() {
  const [selectedTab, setSelectedTab] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <ProfileContext.Provider value={{ setSelectedTab }}>
      <div className="ProfileLayout">
        <Sidebar selectedTab={selectedTab} />
        <Outlet />
      </div>
    </ProfileContext.Provider>
  );
}
import { FaRegUserCircle, FaShieldAlt } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { LuLogOut } from 'react-icons/lu';

function Sidebar({ selectedTab }) {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  return (
    <div className="ProfileLayout_Sidebar">
      <SidebarTab
        icon={<FaRegUserCircle />}
        name={'Thông tin cá nhân'}
        description={'Cập nhật thông tin cá nhân'}
        handleOnClick={() => {
          navigate('/profile/account-info');
        }}
        isSelected={selectedTab === 1}
      />
      <SidebarTab
        icon={<FaShieldAlt />}
        name={'Đổi mật khẩu'}
        description={'Cập nhật thông tin bảo mật'}
        handleOnClick={() => {
          navigate('/profile/change-password');
        }}
        isSelected={selectedTab === 2}
      />
      <SidebarTab
        icon={<FaLocationDot />}
        name={'Sổ địa chỉ'}
        description={'Cập nhật thông tin giao hàng'}
        handleOnClick={() => {
          navigate('/profile/address');
        }}
        isSelected={selectedTab === 3}
      />
      <SidebarTab
        icon={<BotIcon />}
        name={'Trung tâm gợi ý'}
        description={'Gợi ý các sản phẩm phù hợp với bạn'}
        handleOnClick={() => {
          navigate('/profile/suggestion');
        }}
        isSelected={selectedTab === 4}
      />
      <SidebarTab
        icon={<LuLogOut />}
        name={'Đăng xuất'}
        description={''}
        handleOnClick={async () => {
          await authStore.signOut();
          await cartStore.clearCart();
          await navigate('/');
          toast.success('Đăng xuất thành công!');
        }}
      />
    </div>
  );
}
import { IoMdArrowRoundForward } from 'react-icons/io';
import { useEffect, useState } from 'react';
import useAuthStore from '../../contexts/zustands/AuthStore';
import { toast } from 'sonner';
import useCartStore from '@/contexts/zustands/CartStore';
import { BotIcon } from 'lucide-react';

function SidebarTab({ icon, name, description, isSelected, handleOnClick }) {
  return (
    <div
      className={`SidebarTab ${isSelected && 'selected'}`}
      onClick={handleOnClick}
    >
      <div style={{ fontSize: '24px' }}>{icon}</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexGrow: '1',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '500' }}>{name}</div>
        <div style={{ fontSize: '12px' }}>{description}</div>
      </div>
      <div style={{ color: 'var(--color-preset-red)' }}>
        <IoMdArrowRoundForward fontSize={24} />
      </div>
    </div>
  );
}
