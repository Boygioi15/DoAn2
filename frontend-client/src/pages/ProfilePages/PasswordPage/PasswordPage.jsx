import { useContext, useEffect, useState } from 'react';
import './PasswordPage.css';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { PasswordField } from '../../../reusable_components/comps';
import { passwordRules } from '../../../constants';
import authApi from '@/api/authApi';
import { UltilityContext_1 } from '@/contexts/UltilityContext_1';
import { toast } from 'sonner';
export default function PasswordPage() {
  const { setSelectedTab } = useContext(ProfileContext);
  const [oldPassword, setOldPassword] = useState('');
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
  };
  const { storeToastMessageInLocalStorage, showToastMessageInLocalStorage } =
    useContext(UltilityContext_1);
  useEffect(() => {
    showToastMessageInLocalStorage();
  }, []);
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateUserPassword({
        oldPassword: oldPassword,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });
      toast.success('Cập nhật mật khẩu thành công');

      setPassword('');
      setOldPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Cập nhật mật khẩu thất bại');
    }
  };
  useEffect(() => {
    setSelectedTab(2);
  }, []);
  //api call
  return (
    <div className="ProfilePage">
      <div className="ProfilePage_Title_Block">
        <div className="ProfilePage_Title">ĐỔI MẬT KHẨU</div>
        <div className="ProfilePage_Description">
          Cập nhật thông tin bảo mật cho tài khoản của bạn
        </div>
        <form className="account-info-table" onSubmit={handleOnSubmit}>
          <div className="input-block">
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Mật khẩu cũ
            </div>
            <PasswordField
              className={`SignUpDetailPage_PasswordField`}
              placeholder="Mật khẩu cũ. Nếu đây là lần đầu bạn đổi mật khẩu, hãy để trống"
              passwordText={oldPassword}
              handleOnChange={(e) => {
                setOldPassword(e.target.value);
              }}
            />
          </div>
          <div className="input-block">
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Mật khẩu mới
            </div>
            <PasswordField
              className={`SignUpDetailPage_PasswordField`}
              placeholder="Mật khẩu mới"
              passwordText={password}
              handleOnChange={(e) => {
                setPassword(e.target.value);
                checkPasswordErrors(e.target.value);
              }}
              isError={password.length > 0 && passwordErrors.length > 0}
            />
          </div>

          {password.length > 0 && passwordErrors.length > 0 && (
            <ul className="ul-error">
              {passwordErrors.map((element, idx) => (
                <li key={idx}>{element}</li>
              ))}
            </ul>
          )}
          <div className="input-block">
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Xác nhận khẩu mới
            </div>
            <PasswordField
              className="SignUpDetailPage_PasswordField"
              placeholder="Xác nhận mật khẩu"
              passwordText={confirmPassword}
              handleOnChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              isError={
                confirmPassword.length > 0 && password !== confirmPassword
              }
            />
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <ul className="ul-error">
              <li>Xác nhận mật khẩu và mật khẩu phải trùng nhau!</li>
            </ul>
          )}
          <button
            style={{ width: '100%' }}
            disabled={
              passwordErrors.length > 0 ||
              password !== confirmPassword ||
              password.length === 0 ||
              oldPassword.length === 0
            }
            className="button-standard-1"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
