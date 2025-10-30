import { Link, Outlet, useNavigate } from 'react-router-dom';
import './Authlayout.css';
import { Title } from '../../reusable_components/comps';
import { BotLayout } from '../RootLayout/RootLayout';
import { createContext, useEffect, useState } from 'react';
import ModalContextProvider from '../../contexts/ModalContext';
import UltilityContextProvider_1 from '../../contexts/UltilityContext_1';
import { Toaster } from '@/components/ui/sonner';

export const AuthPageContext = createContext();
export default function AuthLayout() {
  const [authState, setAuthState] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/auth/sign-in');
  }, []);

  return (
    <div className="AuthLayout">
      <ModalContextProvider>
        <UltilityContextProvider_1>
          <Auth_Title state={authState} />
          <AuthPageContext.Provider value={{ authState, setAuthState }}>
            <Outlet />
          </AuthPageContext.Provider>
          <BotLayout />
          <Toaster />
        </UltilityContextProvider_1>
      </ModalContextProvider>
    </div>
  );
}

function Auth_Title({ state }) {
  let title = {
    1: 'Đăng nhập',
    2: 'Đăng ký',
    3: 'Quên mật khẩu',
  };

  return (
    <div className="Auth_Title">
      <Title />
      {title[state] || 'Troll'}
    </div>
  );
}
