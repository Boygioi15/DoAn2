import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  OrBlock,
  PasswordField,
  SocialLogin,
} from '../../reusable_components/comps';

import facebook from '../../assets/facebook.png';
import google from '../../assets/google.png';
import phone from '../../assets/phone.jpg';
import { ModalContext } from '../../contexts/ModalContext';
import { SMS_LoginModal } from './AuthModal';

export function SignInBox({ onStateChange }) {
  const { openModal } = useContext(ModalContext);
  // state for inputs
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // submit handler (defined outside JSX)
  const handleSubmit = (e) => {
    e.preventDefault();

    // example login check
    if (account === 'test' && password === '123') {
      setError('');
      console.log('Đăng nhập thành công');
      // redirect or do login here
    } else {
      setError('Đăng nhập thất bại');
    }
  };

  return (
    <div className="AuthBox" onSubmit={handleSubmit}>
      <div className="AuthBox_Title">Đăng nhập</div>
      <button
        onClick={() => {
          hi = 3;
        }}
      >
        BUG BUG
      </button>
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

        {error && <div className="AuthBox_Error">{error}</div>}

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
        <SocialLogin
          handleOnClick={() => openModal(<SMS_LoginModal />)}
          imgSrc={phone}
          text="SMS"
        />
      </div>
      <div className="AuthBox_ChangeState">
        <div>Bạn mới biết đến Q-Shop? </div>
        <button className="Stripped_Off_Button" onClick={onStateChange}>
          <b>Đăng ký</b>
        </button>
      </div>
    </div>
  );
}
export function SignUpBox({ onStateChange }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { openModal } = useContext(ModalContext);
  function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing
    console.log('Form submitted!');
    navigate('/auth/sign-up-detail');
  }

  return (
    <div className="AuthBox">
      <div className="AuthBox_Title">Đăng ký</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-standard-1"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        {error && <div className="AuthBox_Error">{error}</div>}

        <button type="submit" className="button-standard-1">
          Tiếp theo
        </button>
      </form>
      <OrBlock />
      <div className="SocialLoginBlock">
        <div>
          <SocialLogin imgSrc={facebook} text="Facebook" />
          <SocialLogin imgSrc={google} text="Google" />
        </div>
      </div>
      <div className="AuthBox_ChangeState">
        <div>Bạn đã có tài khoản? </div>
        <button className="Stripped_Off_Button" onClick={onStateChange}>
          <b>Đăng nhập</b>
        </button>
      </div>
    </div>
  );
}
