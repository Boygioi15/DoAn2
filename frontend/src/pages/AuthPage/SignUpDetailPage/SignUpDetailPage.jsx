import { useContext, useEffect, useState } from 'react';
import './SignUpDetailPage.css';
import OTPInput from 'react-otp-input';
import { Time_NumToText } from '../../../utils/util';
import { FaArrowLeft } from 'react-icons/fa6';
import { PasswordField } from '../../../reusable_components/comps';

export function SignUpDetailPage1() {
  return (
    <div className="SignUpDetailPage">
      <SignUpProgress state={1} />
      <EnterOTPBox />
    </div>
  );
}
export function SignUpDetailPage2() {
  return (
    <div className="SignUpDetailPage">
      <SignUpProgress state={2} />
      <SetPasswordBox />
    </div>
  );
}
export function SignUpDetailPage3() {
  return (
    <div className="SignUpDetailPage">
      <SignUpProgress state={3} />
      <FinishBox />
    </div>
  );
}
function EnterOTPBox() {
  const [otp, setOtp] = useState('');
  const phone = useAuthStore((obj) => obj.phone);
  const [error, setError] = useState('');
  const { openModal } = useContext(ModalContext);
  const navigate = useNavigate();
  //countdown
  const [countdown, setCountdown] = useState();
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  //send-otp on refresh
  const sendOtp = async () => {
    let bouncebackDate;
    console.log(phone);
    try {
      const response = await authApi.sendOtpPhone(phone);
      bouncebackDate = new Date(response.data.bounceback);
    } catch (error) {
      bouncebackDate = new Date(error.response.data.bounceback);
      setError(error.response.data.msg);
    } finally {
      const countdown = bouncebackDate - Date.now();
      console.log('countdown: ', countdown);
      setCountdown(Math.floor(countdown / 1000));
    }
  };
  const setAccessToken = useAuthStore((obj) => obj.setAccessToken);
  const setRefreshToken = useAuthStore((obj) => obj.setRefreshToken);
  const verifyOtp = async () => {
    console.log('Verify otp');
    try {
      const response = await authApi.register_VerifyOtpPhone(phone, otp);
      const data = response.data;
      const at = data.accessToken;
      const rt = data.refreshToken;
      await setAccessToken(at);
      await setRefreshToken(rt);
      navigate('/auth/sign-up-detail/2');
    } catch (error) {
      setError(error.response.data.msg);
    }
  };

  useEffect(() => {
    sendOtp();
  }, []);

  //handle resend

  return (
    <div className="SignUpDetail_Box">
      <div className="SignUpDetail_Box_Title">
        <div style={{ fontSize: '20px', fontWeight: '600' }}>
          Nhập mã xác nhận
        </div>
        <div style={{ fontSize: '14px', fontWeight: '400' }}>
          Nhập mã xác nhận đã được gửi đến số điện thoại
          <br /> <b>{phone}</b>
        </div>
      </div>
      <OTPInput
        value={otp}
        onChange={setOtp}
        numInputs={4}
        renderInput={(props) => <input {...props} className="otp-block" />}
        inputStyle={{ width: '40px', height: '40px' }}
        containerStyle={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          justifyContent: 'center',
        }}
      />
      {countdown > 0 ? (
        <div className="div-standard-1">
          <div>Gửi lại mã xác thực sau: </div>
          <div style={{ fontWeight: 'bold', color: 'red', marginLeft: '4px' }}>
            {Time_NumToText(countdown)}
          </div>
        </div>
      ) : (
        <button
          className="Stripped_Off_Button"
          onClick={() => {
            sendOtp();
          }}
          style={{
            color: 'blue',
            fontWeight: '500',
            width: 'fit-content',
            alignSelf: 'center',
          }}
        >
          Gửi lại mã xác thực
        </button>
      )}
      {error && <div className="error-text">{error}</div>}

      <button
        style={{ width: '100%' }}
        className="button-standard-1"
        onClick={() => {
          verifyOtp();
        }}
      >
        Xác nhận
      </button>

      <button className="Escape_Button SignUpDetailPage_Escape_Button">
        <FaArrowLeft />
      </button>
    </div>
  );
}
const passwordRules = [
  {
    condition: (pStr) => pStr.length < 8,
    error: 'Mật khẩu không được dưới 8 kí tự',
  },
  {
    condition: (pStr) => !/[A-Z]/.test(pStr), // no uppercase
    error: 'Mật khẩu phải chứa ít nhất một kí tự viết hoa',
  },
  {
    condition: (pStr) => !/[0-9]/.test(pStr), // no number
    error: 'Mật khẩu phải chứa ít nhất một chữ số',
  },
];

function SetPasswordBox() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [error, setError] = useState('');
  const checkPasswordErrors = (passwordToCheck) => {
    const pStr = passwordToCheck.toString().trim();
    let newPasswordErrors = [];
    passwordRules.forEach((rule) => {
      if (rule.condition(pStr)) {
        newPasswordErrors.push(rule.error);
      }
    });
    setPasswordErrors(newPasswordErrors);
    //console.log(passwordToCheck);
    //console.log(newPasswordErrors);
    //console.log(newPasswordErrors.length);
  };
  const navigate = useNavigate();
  const skipPassword = () => {
    navigate('/auth/sign-up-detail/3');
  };
  const { openModal } = useContext(ModalContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authApi.updateUserPassword({
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });
      navigate('/auth/sign-up-detail/3');
      console.log('Final response:', response);
    } catch (error) {
      if (error.authError) {
        openModal({
          modalContent: (
            <PromptModal
              line1={'\nBạn không có quyền thực hiện thao tác này!'}
              line2={'Vui lòng đăng nhập lại!'}
              onClose={() => navigate('/auth')}
            />
          ),
          disableBackdropClose: true,
        });
      }
      console.log('Final error:', error);
      //setError(error.response.data.msg);
    }
  };
  return (
    <div className="SignUpDetail_Box">
      <div className="SignUpDetail_Box_Title">
        <div style={{ fontSize: '20px', fontWeight: '600' }}>
          Thiết lập mật khẩu
        </div>
        <div style={{ fontSize: '14px', fontWeight: '400' }}>
          Thiết lập mật khẩu cho tài khoản của bạn để
          <br /> tăng tính bảo mật
        </div>
      </div>
      <form className="SignUpDetail_Form" onSubmit={handleSubmit}>
        <PasswordField
          className={`SignUpDetailPage_PasswordField`}
          passwordText={password}
          handleOnChange={(e) => {
            setPassword(e.target.value);
            checkPasswordErrors(e.target.value);
          }}
          isError={password.length > 0 && passwordErrors.length > 0}
        />
        {password.length > 0 && passwordErrors.length > 0 && (
          <ul>
            {passwordErrors.map((element, idx) => (
              <li key={idx}>{element}</li>
            ))}
          </ul>
        )}
        <PasswordField
          className="SignUpDetailPage_PasswordField"
          placeholder="Xác nhận mật khẩu"
          passwordText={confirmPassword}
          handleOnChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
          isError={confirmPassword.length > 0 && password !== confirmPassword}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <ul>
            <li>Xác nhận mật khẩu và mật khẩu phải trùng nhau!</li>
          </ul>
        )}
        {error && <div className="error-text">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
          <button
            type="button"
            style={{ width: '100%' }}
            className="button-standard-2"
            onClick={() => {
              skipPassword();
            }}
          >
            Bỏ qua
          </button>
          <button
            style={{ width: '100%' }}
            disabled={
              passwordErrors.length > 0 ||
              password !== confirmPassword ||
              password.length === 0
            }
            className="button-standard-1"
          >
            Xác nhận
          </button>
        </div>
      </form>
    </div>
  );
}

import finish from '../../../assets/finish.png';
function FinishBox() {
  const navigate = useNavigate();
  const handleFinish = () => {
    navigate('/');
  };
  return (
    <div>
      <div className="SignUpDetail_Box">
        <div className="SignUpDetail_Box_Title">
          <div style={{ fontSize: '20px', fontWeight: '600' }}>Hoàn tất</div>
          <div style={{ fontSize: '14px', fontWeight: '400' }}>
            Chúc mừng bạn đã đăng ký thành công
            <br /> Quá dễ phải không nào?
          </div>
        </div>
        <img src={finish} />
        <button
          onClick={handleFinish}
          style={{ width: '100%' }}
          className="button-standard-1"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
}

import { HiArrowLongRight } from 'react-icons/hi2';
import useAuthStore from '../../../contexts/zustands/AuthStore';
import { otp_bounceback } from '../../../constants';
import authApi from '../../../api/authApi';
import { ModalContext } from '../../../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';
import { PromptModal } from '../../../reusable_components/PromptModal';

function SignUpProgress({ state }) {
  return (
    <div className="SignUpProgress">
      <div className="SignUpProgress_Block">
        <div
          className={`SignUpProgress_Circle ${
            state >= 1 ? ' SignUpProgress_Marked_Circle' : ''
          }`}
        >
          1
        </div>
        <div
          className={`SignUpProgress_Text ${
            state >= 1 ? ' SignUpProgress_Marked_Text' : ''
          }`}
        >
          Nhập mã xác nhận
        </div>
      </div>

      <HiArrowLongRight
        className={`SignUpProgress_Arrow ${
          state >= 2 ? ' SignUpProgress_Marked_Arrow' : ''
        }`}
      />
      {/* 2*/}
      <div className="SignUpProgress_Block">
        <div
          className={`SignUpProgress_Circle ${
            state >= 2 ? ' SignUpProgress_Marked_Circle' : ''
          }`}
        >
          2
        </div>
        <div
          className={`SignUpProgress_Text ${
            state >= 2 ? ' SignUpProgress_Marked_Text' : ''
          }`}
        >
          Thiết lập mật khẩu
        </div>
      </div>

      <HiArrowLongRight
        className={`SignUpProgress_Arrow ${
          state >= 3 ? ' SignUpProgress_Marked_Arrow' : ''
        }`}
      />

      {/* 3 */}
      {/* 2*/}
      <div className="SignUpProgress_Block">
        <div
          className={`SignUpProgress_Circle ${
            state >= 3 ? ' SignUpProgress_Marked_Circle' : ''
          }`}
        >
          3
        </div>
        <div
          className={`SignUpProgress_Text ${
            state >= 3 ? ' SignUpProgress_Marked_Text' : ''
          }`}
        >
          Hoàn tất
        </div>
      </div>
    </div>
  );
}
