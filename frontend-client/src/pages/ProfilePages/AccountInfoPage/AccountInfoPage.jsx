import { useContext, useEffect, useState } from 'react';
import './AccountInfoPage.css';
import '../ProfilePage.css';
import { ProfileContext } from '../../../contexts/ProfileContext';
import userApi from '../../../api/userApi';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'sonner';

import { MdModeEdit } from 'react-icons/md';
import {
  InputBlock_Date,
  InputBlock_Input,
  InputBlock_Select,
} from '../../../reusable_components/comps';
import { UltilityContext_1 } from '@/contexts/UltilityContext_1';
import { emailRegex, nameRegex, phoneRegex } from '@/util';

export default function AccountInfoPage() {
  const { convenience_1 } = useContext(UltilityContext_1);
  //true: view, false: edit
  const [boxState, setBoxState] = useState(true);
  const { setSelectedTab } = useContext(ProfileContext);
  const [accountInfo, setAccountInfo] = useState();
  const [formErrors, setFormErrors] = useState([]);
  const getAccountInfo = async () => {
    try {
      const response = await userApi.getAccountInfo();
      setAccountInfo(response.data.accountInfo);
    } catch (error) {
      if (error.authError) {
        convenience_1();
      }
      toast.error('Lỗi khi lấy dữ liệu người dùng');
    }
  };
  const updateUserInfo = async (formData) => {
    const _formErrors = [];
    if (formData.name && !nameRegex.test(formData.name)) {
      _formErrors.push('Định dạng tên không hợp lệ!');
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      _formErrors.push('Định dạng tên không hợp lệ!');
    }
    if (formData.email && !emailRegex.test(formData.email)) {
      _formErrors.push('Định dạng email không hợp lệ!');
    }
    if (_formErrors.length > 0) {
      setFormErrors(_formErrors);
      return;
    }
    setFormErrors(_formErrors);
    try {
      const response = await userApi.updateAccountInfo(formData);
      setBoxState(true);
      toast.success('Cập nhật thông tin người dùng thành công!');
      getAccountInfo();
    } catch (error) {
      toast.error('Cập nhật thông tin người dùng thất bại');
      setFormErrors([error.response.data.message]);
      if (error.authError) {
        convenience_1();
      }
    }
  };
  //get userInfo on loading
  useEffect(() => {
    getAccountInfo();
  }, []);
  useEffect(() => {
    setSelectedTab(1);
    console.log('User info: ', accountInfo);
  }, [accountInfo]);

  return (
    <div className="ProfilePage">
      <div className="ProfilePage_Title_Block">
        <div className="ProfilePage_Title">THÔNG TIN CÁ NHÂN</div>
        <div className="ProfilePage_Description">
          Cập nhật thông tin tài khoản để nhận các ưu đãi từ Q-Shop
        </div>
      </div>
      {boxState ? (
        <ViewBox
          accountInfo={accountInfo}
          handleOnEdit={() => {
            setBoxState(false);
          }}
        />
      ) : (
        <EditBox
          accountInfo={accountInfo}
          handleOnCancel={() => {
            setBoxState(true);
            setFormErrors([]);
          }}
          handleOnSubmit={updateUserInfo}
          errors={formErrors}
        />
      )}
    </div>
  );
}

function ViewBox({ accountInfo, handleOnEdit }) {
  if (!accountInfo) {
    return null;
  }
  return (
    <div>
      <div className="account-info-table">
        <div className="row">
          <div className="label">Họ và tên</div>
          <div className="value">{accountInfo.name || 'Chưa có thông tin'}</div>
        </div>

        <div className="row">
          <div className="label">Số điện thoại</div>
          <div className="value">
            {accountInfo.phone || 'Chưa có thông tin'}
          </div>
        </div>
        <div className="row">
          <div className="label">Email</div>
          <div className="value">
            {accountInfo.email || 'Chưa có thông tin'}
          </div>
        </div>
        <div className="row">
          <div className="label">Giới tính</div>
          <div className="value">{accountInfo.sex || 'Chưa có thông tin'}</div>
        </div>

        <div className="row">
          <div className="label">Ngày sinh</div>
          <div className="value">
            {accountInfo.birthdate
              ? new Date(accountInfo.birthdate).toLocaleDateString('vi-VN')
              : 'Chưa có thông tin'}
          </div>
        </div>
      </div>
      <button
        style={{ marginTop: '16px' }}
        className="button-standard-2"
        onClick={handleOnEdit}
      >
        <MdModeEdit style={{ fontSize: '20px', marginBottom: '3px' }} />
        <div style={{ fontSize: '14px', marginBottom: '3px' }}>
          {'Chỉnh sửa thông tin'}
        </div>
      </button>
    </div>
  );
}
function EditBox({ accountInfo, errors, handleOnSubmit, handleOnCancel }) {
  const sexValueList = ['Nam', 'Nữ', 'Khác'];
  const [formData, setFormdata] = useState(accountInfo);

  useEffect(() => {
    console.log(formData);
  }, [formData]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleOnSubmit(formData);
      }}
    >
      <div className="account-info-table">
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
          <InputBlock_Input
            label={'Họ và tên'}
            inputValue={formData.name || ''}
            onInputValueChange={(value) => {
              setFormdata((prev) => ({
                ...prev,
                name: value,
              }));
            }}
          />
          <InputBlock_Select
            label={'Giới tính'}
            selectValue={formData.sex || 'Khác'}
            selectValueList={sexValueList}
            onInputValueChange={(value) => {
              setFormdata((prev) => ({
                ...prev,
                sex: value,
              }));
            }}
          />
          <InputBlock_Date
            label={'Ngày sinh'}
            inputValue={formData.birthdate}
            onInputValueChange={(value) => {
              setFormdata((prev) => ({
                ...prev,
                birthdate: value,
              }));
            }}
          />
        </div>
        <InputBlock_Input
          label={'Số điện thoại'}
          inputValue={formData.phone}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              phone: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Email'}
          inputValue={formData.email}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              email: value,
            }));
          }}
        />
      </div>
      {errors.length > 0 && (
        <ul
          style={{ marginTop: '20px', marginBottom: '-4px' }}
          className="ul-error"
        >
          {errors.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
      <div className="account-info-button-block">
        <button
          type="button"
          className="button-standard-2"
          onClick={handleOnCancel}
        >
          Hủy
        </button>
        <button style={{ flexGrow: 1 }} className="button-standard-1">
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
