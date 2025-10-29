import { useContext, useEffect, useState } from 'react';
import './AccountInfoPage.css';
import '../ProfilePage.css';
import { ProfileContext } from '../../../contexts/ProfileContext';
import userApi from '../../../api/userApi';
import { useLoaderData } from 'react-router-dom';

export async function AccountInfoPageLoader() {
  //const userInfo = await userApi.getAccountInfo();
  const userInfo = {
    name: 'Nguyễn Anh Quyền',
    gender: 'Nam',
    phone: '0373865627',
    email: 'boygioi85@gmail.com',
    birthday: '',
  };
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { userInfo };
}
export default function AccountInfoPage() {
  //true: view, false: edit
  const { setSelectedTab } = useContext(ProfileContext);
  const { userInfo } = useLoaderData();

  useEffect(() => {
    setSelectedTab(1);
    console.log('User info: ', userInfo);
  }, []);

  const updateUserInfo = (formData) => {};
  const [boxState, setBoxState] = useState(true);
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
          userInfo={userInfo}
          handleOnEdit={() => {
            setBoxState(false);
          }}
        />
      ) : (
        <EditBox
          userInfo={userInfo}
          handleOnCancel={() => setBoxState(true)}
          handleOnSubmit={updateUserInfo}
          errors={['Gà quá', '???', 'Troll à']}
        />
      )}
    </div>
  );
}
import { MdModeEdit } from 'react-icons/md';
import {
  InputBlock_Date,
  InputBlock_Input,
  InputBlock_Select,
} from '../../../reusable_components/comps';
function ViewBox({ userInfo, handleOnEdit }) {
  return (
    <div>
      <div className="account-info-table">
        <div className="row">
          <div className="label">Họ và tên</div>
          <div className="value">{userInfo.name || 'Chưa có thông tin'}</div>
        </div>

        <div className="row">
          <div className="label">Số điện thoại</div>
          <div className="value">{userInfo.phone || 'Chưa có thông tin'}</div>
        </div>
        <div className="row">
          <div className="label">Email</div>
          <div className="value">{userInfo.email || 'Chưa có thông tin'}</div>
        </div>
        <div className="row">
          <div className="label">Giới tính</div>
          <div className="value">{userInfo.gender || 'Chưa có thông tin'}</div>
        </div>

        <div className="row">
          <div className="label">Ngày sinh</div>
          <div className="value">
            {userInfo.birthday || 'Chưa có thông tin'}
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
function EditBox({ userInfo, errors, handleOnSubmit, handleOnCancel }) {
  const genderValueList = ['Nam', 'Nữ', 'Khác'];
  const [formData, setFormdata] = useState(userInfo);

  useEffect(() => {
    console.log(formData);
  }, [formData]);
  return (
    <form onSubmit={() => handleOnSubmit(formData)}>
      <div className="account-info-table">
        <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
          <InputBlock_Input
            label={'Họ và tên'}
            value={formData.name || ''}
            onInputValueChange={(value) => {
              setFormdata((prev) => ({
                ...prev,
                name: value,
              }));
            }}
          />
          <InputBlock_Select
            label={'Giới tính'}
            selectValue={formData.gender || 'Khác'}
            selectValueList={genderValueList}
            onInputValueChange={(value) => {
              setFormdata((prev) => ({
                ...prev,
                gender: value,
              }));
            }}
          />
          <InputBlock_Date
            label={'Ngày sinh'}
            value={formData.birthdate}
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
          value={formData.phone || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              phone: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Email'}
          value={formData.email || ''}
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
