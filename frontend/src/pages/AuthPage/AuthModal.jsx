import { useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../contexts/ModalContext';
import OtpInput from 'react-otp-input';
import { Time_NumToText } from '../../utils/util';
import authApi from '../../api/authApi';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../contexts/zustands/AuthStore';

export function SMS_LoginModal() {
  const { openModal, closeModal } = useContext(ModalContext);
  const [phone, setPhone] = useState('');
  const [notFoundPhoneShow, setNotFoundPhoneShow] = useState(false);
  const handleSubmit = async () => {
    const result = await checkSignInCondition();
    if (result) {
      console.log('HERE!');
      openModal({
        modalContent: <SMS_VerificationModal phone={phone} />,
        disableBackdropClose: true,
      });
    }
  };
  const checkSignInCondition = async () => {
    try {
      const response = await authApi.checkPhoneSignInCondition(phone);
      return true;
    } catch (error) {
      console.log(error);
      setNotFoundPhoneShow(true);
      return false;
    }
    return false;
  };

  return (
    <div className="SMS_LoginModal">
      <div className="SMS_LoginModal_Title">
        <div style={{ fontSize: '18px', fontWeight: '600' }}>
          Đăng nhập bằng SMS
        </div>
        <div style={{ fontSize: '13px', fontWeight: '400' }}>
          Vui lòng nhập số điện thoại để chúng tôi
          <br /> có thể gửi OTP cho bạn
        </div>
      </div>
      <input
        type="text"
        className="input-standard-1"
        placeholder="Số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {notFoundPhoneShow && (
        <div>
          <div style={{ fontSize: '14px' }} className="error-text">
            Không tìm thấy số điện thoại trong CSDL !
            <a className="link-standard-1" href="/auth/sign-up">
              {'  Đăng ký?'}
            </a>
          </div>
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={phone.length === 0}
        className="button-standard-1"
      >
        Gửi OTP
      </button>
      <button
        onClick={() => closeModal()}
        className="Escape_Button SMS_Modal_Escape_Button"
      >
        X
      </button>
    </div>
  );
}
export function SMS_VerificationModal({ phone }) {
  const { openModal, closeModal } = useContext(ModalContext);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  //send-otp on refresh
  const sendOtp = async () => {
    setError('');
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
      setCountdown(Math.floor(countdown / 1000) + 1);
    }
  };
  useEffect(() => {
    sendOtp();
  }, []);
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
      window.location.href = '/';
    } catch (error) {
      console.log(error);
      setError(error.response.data.msg);
    }
  };

  //countdown
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [countdown]);
  //resend option
  return (
    <div className="SMS_LoginModal">
      <div className="SMS_LoginModal_Title">
        <div style={{ fontSize: '18px', fontWeight: '600' }}>
          Nhập mã xác nhận
        </div>
        <div style={{ fontSize: '13px', fontWeight: '400' }}>
          Nhập mã xác thực đã được gửi qua số điện thoại
          <br /> <b>{phone}</b>
        </div>
      </div>
      <OtpInput
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
      {error && (
        <div
          style={{ display: 'flex', alignSelf: 'center' }}
          className="error-text"
        >
          {error}
        </div>
      )}
      <button
        onClick={() => verifyOtp()}
        disabled={otp.length === 0}
        className="button-standard-1"
      >
        Xác nhận
      </button>
      <button
        onClick={() => closeModal()}
        className="Escape_Button SMS_Modal_Escape_Button"
      >
        X
      </button>
    </div>
  );
}
