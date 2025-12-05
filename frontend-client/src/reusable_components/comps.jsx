import { Link } from 'react-router-dom';
import './comps.css';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
export function InputBlock_Input({
  label,
  placeholder,
  inputValue,
  onInputValueChange,
  isFormRequired,
}) {
  return (
    <div className="input-block">
      <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
      <input
        className="input-standard-1"
        value={inputValue}
        placeholder={placeholder}
        required={isFormRequired}
        onChange={(e) => onInputValueChange(e.target.value)}
      />
    </div>
  );
}
export function InputBlock_TextArea({
  label,
  placeholder,
  inputValue,
  onInputValueChange,
  isFormRequired,
}) {
  return (
    <div className="input-block">
      <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
      <textarea
        className="input-standard-1"
        value={inputValue}
        onChange={(e) => onInputValueChange(e.target.value)}
        placeholder={placeholder}
        required={isFormRequired}
      />
    </div>
  );
}
export function InputBlock_Select({
  label,
  selectValue,
  selectValueList,
  onInputValueChange,
}) {
  return (
    <div className="input-block">
      <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
      <select
        className="input-standard-1"
        value={selectValue} // controlled select
        onChange={(e) => onInputValueChange(e.target.value)}
      >
        {selectValueList.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InputBlock_SelectWithSearch({
  label,
  placeholder,
  selectValue,
  defaultSelectValue,
  selectValueList,
  onInputValueChange,
  isDisabled,
}) {
  return (
    <div className="input-block">
      <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
      <Select
        value={selectValue}
        onValueChange={onInputValueChange}
        disabled={isDisabled}
      >
        <SelectTrigger className="w-full text-[13px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {defaultSelectValue && (
            <SelectItem
              key={defaultSelectValue.id}
              value={defaultSelectValue.id}
            >
              {defaultSelectValue.name}
            </SelectItem>
          )}
          {selectValueList.map((element) => (
            <SelectItem key={element.id} value={element.id}>
              {element.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function InputBlock_Date({ label, inputValue, onInputValueChange }) {
  return (
    <div className="input-block">
      <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
      <DatePicker
        className="input-standard-1 width100"
        selected={inputValue ? new Date(inputValue) : null}
        onChange={(date) =>
          onInputValueChange(date.toISOString().split('T')[0])
        }
        dateFormat="dd/MM/yyyy"
        placeholderText="Chọn ngày sinh"
      />
    </div>
  );
}
