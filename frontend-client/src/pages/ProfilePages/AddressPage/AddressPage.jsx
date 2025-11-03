import { FaLocationDot } from 'react-icons/fa6';
import { useContext, useEffect, useState } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import './AddressPage.css';

import { MdOutlineDeleteOutline } from 'react-icons/md';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfileContext } from '@/contexts/ProfileContext';
import AddressForm from './AddressForm';

import { FaFontAwesomeFlag } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdModeEdit } from 'react-icons/md';
import userApi from '@/api/userApi';
import { toast } from 'sonner';
import { UltilityContext_1 } from '@/contexts/UltilityContext_1';
import { add } from 'date-fns';

const addresses = [
  {
    addressId: 1,
    contact_name: 'Nguyễn Anh Quyền',
    contact_phone: '0373865627',
    isActive: true,
    address: 'abcdef abdedadad adasdasd',
  },
  {
    addressId: 2,
    contact_name: 'Lê Văn Troll Troll',
    contact_phone: '0123456789',
    isActive: false,
    address: 'abcdef abdedadad',
  },
];
export default function AddressPage() {
  const { setSelectedTab } = useContext(ProfileContext);
  const { openModal, closeModal } = useContext(ModalContext);
  const { convenience_1 } = useContext(UltilityContext_1);
  const [addressList, setAddressList] = useState([]);

  const setAndSortAddressList = (addressList) => {
    addressList.sort((a, b) => Number(b.isActive) - Number(a.isActive));
    setAddressList(addressList);
  };
  const getAllAddress = async () => {
    try {
      const response = await userApi.getAllUserAddress();
      const addressList = response.data.newAllUserAddress;
      setAndSortAddressList(addressList);
    } catch (error) {
      if (error.authError) {
        convenience_1();
      }
      toast.error('Có lỗi khi lấy dữ liệu địa chỉ');
    }
  };
  const handleOnEditAddressBlock = (address) => {
    openModal({
      modalContent: (
        <AddressForm
          mode="editing"
          initialAddress={structuredClone(address)}
          onEditSubmit={handleOnUpdate}
        />
      ),
    });
  };
  const handleOnActiveClickAddressBlock = async (address) => {
    try {
      const response = await userApi.setDefaultOfUserAddress(address.addressId);
      closeModal();
      setTimeout(
        () => setAndSortAddressList(response.data.newAllUserAddress),
        50
      );
      toast.success('Cập nhật địa chỉ mặc định thành công');
    } catch (error) {
      toast.error('Có lỗi khi cập nhật địa chỉ mặc định');
    }
  };

  const handleOnCreate = async (formData) => {
    console.log(formData);
    try {
      const response = await userApi.createNewUserAddress(formData);
      closeModal();
      setAndSortAddressList(response.data.newAllUserAddress);
      toast.success('Thêm mới địa chỉ thành công');
    } catch (error) {
      toast.error('Có lỗi khi thêm mới địa chỉ');
    }
  };
  const handleOnUpdate = async (formData) => {
    try {
      const response = await userApi.updateUserAddress(formData);
      closeModal();
      setAndSortAddressList(response.data.newAllUserAddress);
      toast.success('Cập nhật địa chỉ thành công');
    } catch (error) {
      toast.error('Có lỗi khi cập nhật địa chỉ');
    }
  };
  const handleOnDeleteAddressBlock = async (address) => {
    const addressId = address.addressId;
    try {
      const response = await userApi.deleteUserAddress(addressId);
      setAndSortAddressList(response.data.newAllUserAddress);
      toast.success('Xóa địa chỉ thành công');
    } catch (error) {
      toast.error('Có lỗi khi xóa địa chỉ');
    }
  };
  useEffect(() => {
    getAllAddress();
  }, []);

  useEffect(() => {
    setSelectedTab(3);
  }, []);
  return (
    <div className="ProfilePage">
      <div className="ProfilePage_Title_Block">
        <div className="ProfilePage_Title">SỔ ĐỊA CHỈ</div>
      </div>
      <button
        style={{ width: 'fit-content', marginTop: '16px' }}
        className="button-standard-2"
        onClick={() => {
          openModal({
            modalContent: (
              <AddressForm mode="creating" onCreateSubmit={handleOnCreate} />
            ),
          });
        }}
      >
        <FaLocationDot style={{ fontSize: '20px', marginBottom: '3px' }} />
        <div style={{ fontSize: '14px', marginBottom: '3px' }}>
          Thêm địa chỉ mới
        </div>
      </button>
      <div className="address-list">
        {addressList.length > 0 ? (
          addressList.map((address) => (
            <AddressBlock
              address={address}
              handleOnEdit={handleOnEditAddressBlock}
              handleOnDelete={handleOnDeleteAddressBlock}
              key={address.addressId}
              includeDelete={!(address.isActive || addressList.length === 1)}
              handleOnActiveClick={handleOnActiveClickAddressBlock}
            />
          ))
        ) : (
          <h1>Hiện bạn chưa có địa chỉ. Vui lòng tạo địa chỉ mới</h1>
        )}
      </div>
    </div>
  );
}

function AddressBlock({
  address,
  handleOnEdit,
  handleOnDelete,
  handleOnActiveClick,
  includeDelete,
}) {
  const { openModal } = useContext(ModalContext);
  return (
    <div key={address.id} className="address-block">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <div className="address-block-contact">
          <div style={{ fontWeight: '700' }}>{address.contact_name}</div>
          <div>|</div>
          <div>{address.contact_phone}</div>
        </div>

        <AddressBlockDropdownMenu
          handleOnEdit={() => handleOnEdit(address)}
          handleOnDelete={() => handleOnDelete(address)}
          includeDelete={includeDelete}
        />
      </div>
      <div>{address.address_detail}</div>
      <button
        className={`address-block-default-flag ${
          address.isActive ? 'active' : ''
        }`}
        onClick={() => handleOnActiveClick(address)}
        disabled={address.isActive}
      >
        <FaFontAwesomeFlag />
        Địa chỉ mặc định
      </button>
    </div>
  );
}

export function AddressBlockDropdownMenu({
  handleOnEdit,
  handleOnDelete,
  includeDelete,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="padding-4 border-none">
          <BsThreeDotsVertical className="address-icon" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-20 text-[14px]  " // width and text size
        align="start"
      >
        <DropdownMenuItem
          className="flex items-center  gap-2"
          onClick={handleOnEdit}
        >
          <MdModeEdit className="text-[16px] w-4" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        {includeDelete && (
          <DropdownMenuItem
            onClick={handleOnDelete}
            className="flex items-center  gap-2"
          >
            <MdOutlineDeleteOutline className="text-[16px] w-4" />
            <span>Xóa địa chỉ</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
