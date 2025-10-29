import { FaLocationDot } from 'react-icons/fa6';
import { useContext, useEffect } from 'react';
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
  const { openModal } = useContext(ModalContext);

  const handleOnEdit = (address) => {
    openModal({
      modalContent: <AddressForm mode="editing" initialAddress={address} />,
    });
  };
  const handleOnDelete = (address) => {};
  const handleOnActiveClick = (address) => {};
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
          console.log('Reached here');
          openModal({ modalContent: <AddressForm mode="creating" /> });
        }}
      >
        <FaLocationDot style={{ fontSize: '20px', marginBottom: '3px' }} />
        <div style={{ fontSize: '14px', marginBottom: '3px' }}>
          Thêm địa chỉ mới
        </div>
      </button>
      <div className="address-list">
        <AddressBlock
          address={addresses[0]}
          handleOnEdit={handleOnEdit}
          handleOnActiveClick={handleOnActiveClick}
          handleOnDelete={handleOnDelete}
        />
        <AddressBlock
          address={addresses[1]}
          handleOnEdit={handleOnEdit}
          handleOnActiveClick={handleOnActiveClick}
          handleOnDelete={handleOnDelete}
        />
        <AddressBlock
          address={addresses[1]}
          handleOnEdit={handleOnEdit}
          handleOnActiveClick={handleOnActiveClick}
          handleOnDelete={handleOnDelete}
        />
      </div>
    </div>
  );
}
import { FaFontAwesomeFlag } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdModeEdit } from 'react-icons/md';

function AddressBlock({
  address,
  handleOnEdit,
  handleOnDelete,
  handleOnActiveClick,
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
        />
      </div>
      <div>{address.address}</div>
      <button
        className={`address-block-default-flag ${
          address.isActive ? 'active' : ''
        }`}
        onClick={handleOnActiveClick}
        disabled={address.isActive}
      >
        <FaFontAwesomeFlag />
        Địa chỉ mặc định
      </button>
    </div>
  );
}

export function AddressBlockDropdownMenu({ handleOnEdit, handleOnDelete }) {
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
        <DropdownMenuItem className="flex items-center  gap-2">
          <MdOutlineDeleteOutline className="text-[16px] w-4" />
          <span>Xóa địa chỉ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
