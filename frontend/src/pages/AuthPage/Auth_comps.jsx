import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  OrBlock,
  PasswordField,
  SocialLogin,
} from '../../reusable_components/comps'

import facebook from '../../assets/facebook.png'
import google from '../../assets/google.png'
import phone from '../../assets/phone.jpg'

export function SignInBox() {
  // state for inputs
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  // submit handler (defined outside JSX)
  const handleSubmit = (e) => {
    e.preventDefault()

    // example login check
    if (account === 'test' && password === '123') {
      setError('')
      console.log('Đăng nhập thành công')
      // redirect or do login here
    } else {
      setError('Đăng nhập thất bại')
    }
  }

  return (
    <div className="SignInBox" onSubmit={handleSubmit}>
      <div className="SignInBox_Title">Đăng nhập</div>
      <form>
        <input
          type="text"
          className="input-standard-1"
          placeholder="Email/ SĐT"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
        />
        <PasswordField />

        {error && <div className="SignInBox_Error">{error}</div>}

        <button type="submit" className="button-standard-1">
          Đăng nhập
        </button>
      </form>
      <Link className="link-standard-1" to="/auth/forgot-password">
        Quên mật khẩu
      </Link>
      <OrBlock />
      <div className="SocialLoginBlock">
        <div>
          <SocialLogin imgSrc={facebook} text="Facebook" />
          <SocialLogin imgSrc={google} text="Google" />
        </div>
        <SocialLogin imgSrc={phone} text="SMS" />
      </div>
      <div className="SignInBox_ChangeStateText">
        <div>Bạn mới biết đến Q-Shop? </div>
        <div className="SignInBox_ChangeState">
          <b>Đăng ký</b>
        </div>
      </div>
    </div>
  )
}
