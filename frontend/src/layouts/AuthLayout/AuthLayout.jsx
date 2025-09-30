import { Link, Outlet } from 'react-router-dom'
import './Authlayout.css'
import { Title } from '../../reusable_components/comps'
import { BotLayout } from '../RootLayout/RootLayout'
import { createContext, useState } from 'react'

export const AuthPageContext = createContext()
export default function AuthLayout() {
  const [authState, setAuthState] = useState(1)
  return (
    <div className="AuthLayout">
      <Auth_Title state={authState} />
      <AuthPageContext.Provider value={{ authState, setAuthState }}>
        <Outlet />
      </AuthPageContext.Provider>
      <BotLayout />
    </div>
  )
}

function Auth_Title({ state }) {
  let title = {
    1: 'Đăng nhập',
    2: 'Đăng ký',
    3: 'Quên mật khẩu',
  }

  return (
    <div className="Auth_Title">
      <Title />
      {title[state] || 'Troll'}
    </div>
  )
}
