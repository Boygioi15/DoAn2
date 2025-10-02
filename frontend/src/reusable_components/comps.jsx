import { Link } from 'react-router-dom';
import './comps.css';
import { useState } from 'react';
export function Title() {
  return (
    <Link to="/" className="title">
      Q-Shop
    </Link>
  );
}

import { RiEyeFill, RiEyeCloseFill } from 'react-icons/ri';

export function PasswordField({
  passwordText,
  handleOnChange,
  placeholder = 'Mật khẩu',
  className,
  isError = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      className={`PasswordField ${className} ${
        isError && 'PasswordField-error'
      }`}
    >
      <input
        type={showPassword ? 'password' : 'text'}
        placeholder={placeholder}
        value={passwordText}
        onChange={handleOnChange}
        required
      />
      <button
        type="button"
        onClick={() => {
          setShowPassword(!showPassword);
        }}
      >
        {showPassword ? (
          <RiEyeFill className="icon-16x16 " />
        ) : (
          <RiEyeCloseFill className="icon-16x16 " />
        )}
      </button>
    </div>
  );
}

export function OrBlock() {
  return (
    <div className="OrBlock">
      <div className="OrBlock_Line"></div>
      <div className="OrBlock_Text">Hoặc</div>
      <div className="OrBlock_Line"></div>
    </div>
  );
}
export function SocialLogin({ imgSrc, text, handleOnClick }) {
  return (
    <button onClick={handleOnClick} className="SocialLogin">
      <img src={imgSrc} />
      <div>{text}</div>
    </button>
  );
}

export function OTP_BlockOf4({ handleOnChange }) {}
