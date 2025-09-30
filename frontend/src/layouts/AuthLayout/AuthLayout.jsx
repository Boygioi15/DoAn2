import { Link, Outlet } from 'react-router-dom'
import './Authlayout.css'
import { Title } from '../../reusable_components/comps'
import { BotLayout } from '../RootLayout/RootLayout'
export default function AuthLayout() {
  return (
    <div className="AuthLayout">
      <Auth_Title state={1} />
      <Outlet />
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
