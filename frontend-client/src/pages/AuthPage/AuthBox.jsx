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
import authApi from '../../api/authApi';
import useAuthStore from '../../contexts/zustands/AuthStore';
import { toast } from 'sonner';
import { phoneRegex } from '@/util';

export function SignInBox() {
  const { openModal } = useContext(ModalContext);
  const authStore = useAuthStore();
  // state for inputs
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  // submit handler (defined outside JSX)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authApi.authenticateUser_AccountPassword(
        account,
        password
      );
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      await authStore.setAccessToken(accessToken);
      await authStore.setRefreshToken(refreshToken);

      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch (error) {
      toast.error('Đăng nhập thất bại');
      setError(error.response.data.msg);
    }
  };

  return (
    <div className="AuthBox">
      <div className="AuthBox_Title">Đăng nhập</div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-standard-1"
          placeholder="Email/ SĐT"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
        />
        <PasswordField
          passwordText={password}
          handleOnChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="error-text">{error}</div>}

        <button
          disabled={account.length === 0 || password.length === 0}
          type="submit"
          className="button-standard-1"
        >
          Đăng nhập
        </button>
      </form>
      <Link className="link-standard-1" to="/auth/sign-up">
        Quên mật khẩu
      </Link>
      <OrBlock />
      <div className="SocialLoginBlock">
        <div>
          <SocialLogin imgSrc={facebook} text="Facebook" />
          <SocialLogin imgSrc={google} text="Google" />
        </div>
        <SocialLogin
          handleOnClick={() =>
            openModal({
              modalContent: <SMS_LoginModal />,
              disableBackdropClose: true,
            })
          }
          imgSrc={phone}
          text="SMS"
        />
      </div>
      <div className="AuthBox_ChangeState">
        <div>Bạn mới biết đến SilkShop? </div>
        <button
          className="Stripped_Off_Button"
          onClick={() => {
            navigate('/auth/sign-up');
          }}
        >
          <b>Đăng ký</b>
        </button>
      </div>
    </div>
  );
}
export function SignUpBox() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { openModal } = useContext(ModalContext);

  const setAuthPhone = useAuthStore((state) => state.setPhone);
  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing
    if (!phoneRegex.test(phone)) {
      setError('Định dạng SĐT không hợp lệ!');
      return;
    }
    setError('');
    try {
      const response = await authApi.checkPhoneSignUpCondition(phone);
      console.log(response);
      setAuthPhone(phone);
      navigate('/auth/sign-up-detail/1');
    } catch (error) {
      console.log(error);
      setError(error.response.data.msg);
    }
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
        {error && <div className="error-text">{error}</div>}
        <button
          type="submit"
          className="button-standard-1"
          disabled={phone.length === 0}
        >
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
        <button
          className="Stripped_Off_Button"
          onClick={() => {
            navigate('/auth/sign-in');
          }}
        >
          <b>Đăng nhập</b>
        </button>
      </div>
    </div>
  );
}
