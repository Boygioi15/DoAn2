import { useContext, useEffect, useState } from 'react';
import './SignUpDetailPage.css';
import OTPInput from 'react-otp-input';
import { Time_NumToText } from '../../../utils/util';
import { FaArrowLeft } from 'react-icons/fa6';
import { PasswordField } from '../../../reusable_components/comps';

export default function SignUpDetailPage() {
  const [signUpState, setSignUpState] = useState(3);
  let box = {
    1: <EnterOTPBox handleOnVerification={() => setSignUpState(2)} />,
    2: <SetPasswordBox />,
    3: <FinishBox />,
  };

  return (
    <div className="SignUpDetailPage">
      <SignUpProgress state={signUpState} />
      {box[signUpState]}
    </div>
  );
}
function EnterOTPBox({ handleOnVerification }) {
  const [otp, setOtp] = useState('');

  //countdown
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [countdown]);

  return (
    <div className="SignUpDetail_Box">
      <div className="SignUpDetail_Box_Title">
        <div style={{ fontSize: '20px', fontWeight: '600' }}>
          Nhập mã xác nhận
        </div>
        <div style={{ fontSize: '14px', fontWeight: '400' }}>
          Nhập mã xác nhận đã được gửi đến số điện thoại
          <br /> <b>{'0123456789'}</b>
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

      <button
        style={{ width: '100%' }}
        onClick={handleOnVerification}
        className="button-standard-1"
      >
        Xác nhận
      </button>
      <button
        onClick={() => closeModal()}
        className="Escape_Button SignUpDetailPage_Escape_Button"
      >
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
  const checkPasswordErrors = (passwordToCheck) => {
    const pStr = passwordToCheck.toString().trim();
    let newPasswordErrors = [];
    passwordRules.forEach((rule) => {
      if (rule.condition(pStr)) {
        newPasswordErrors.push(rule.error);
      }
    });
    setPasswordErrors(newPasswordErrors);
    console.log(passwordToCheck);
    //console.log(newPasswordErrors);
    console.log(newPasswordErrors.length);
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
      <form className="SignUpDetail_Form">
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
        <button
          style={{ width: '100%' }}
          disabled={
            passwordErrors.length > 0 ||
            password !== confirmPassword ||
            password.length === 0
          }
          className="button-standard-1"
          onClick={() => {
            console.log('HELLO');
          }}
        >
          Xác nhận
        </button>
      </form>
    </div>
  );
}

import finish from '../../../assets/finish.png';
function FinishBox() {
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
        <button style={{ width: '100%' }} className="button-standard-1">
          Hoàn tất
        </button>
      </div>
    </div>
  );
}

import { HiArrowLongRight } from 'react-icons/hi2';

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
