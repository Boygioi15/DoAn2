import { useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../contexts/ModalContext';
import OtpInput from 'react-otp-input';
import { Time_NumToText } from '../../utils/util';

export function SMS_LoginModal() {
  const { openModal, closeModal } = useContext(ModalContext);
  const [phone, setPhone] = useState('');
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
      <button
        onClick={() => openModal(<SMS_VerificationModal phoneNumber={phone} />)}
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
export function SMS_VerificationModal({ phoneNumber }) {
  const { openModal, closeModal } = useContext(ModalContext);
  const [otp, setOtp] = useState('');

  //countdown
  const [countdown, setCountdown] = useState(5);
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
          <br /> <b>{phoneNumber}</b>
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
            setCountdown(30);
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
      <button onClick={() => openModal(11212)} className="button-standard-1">
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
