import userApi from '@/api/userApi';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Flag, MapPin } from 'lucide-react';
import { AddressBlockDropdownMenu } from '../ProfilePages/AddressPage/AddressPage';
import SpinnerOverlay from '@/reusable_components/SpinnerOverlay';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AddressForm from '../ProfilePages/AddressPage/AddressForm';

const LocalContext = createContext();
export default function UserAddressBlock({ address, setAddress }) {
  const [loading, setLoading] = useState(false);
  const getDefaultAddress = async () => {
    try {
      setLoading(true);
      const result = await userApi.getDefaultAddress();
      setAddress(result.data[0]);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi  khi lấy địa chỉ người dùng');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getDefaultAddress();
  }, []);
  return (
    <LocalContext.Provider value={{ getDefaultAddress }}>
      <div className={reuseableStyle.block}>
        {loading && <SpinnerOverlay />}
        <span className={reuseableStyle.blockTitle}>
          <MapPin /> Địa chỉ
        </span>
        {address && <DisplayedAddressBlock address={address} />}
      </div>
    </LocalContext.Provider>
  );
}
function DisplayedAddressBlock({ address }) {
  return (
    <div
      key={address.addressId}
      className="w-full p-4 border border-(--color-preset-border-color) rounded-[4px] flex flex-col gap-2"
    >
      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-5">
          <div style={{ fontWeight: '700' }}>{address.contact_name}</div>
          <div>|</div>
          <div>{address.contact_phone}</div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[16px]!"
            >
              <Edit style={{ width: '16px', height: '16px' }} /> Sửa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className={'text-center'}>
                Sổ địa chỉ
              </AlertDialogTitle>
              <Separator />
            </AlertDialogHeader>
            <AddressListDialogContent />
            <AlertDialogCancel
              className={
                'absolute top-5 right-5 border-none hover:text-red-500'
              }
            >
              X
            </AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        <b>Địa chỉ tỉnh/ thành: </b>
        {`${address.province_detail.provinceName}, 
        ${address.province_detail.districtName}, 
        ${address.province_detail.wardName}`}
      </div>
      <div>
        <b>Địa chỉ chi tiết: </b>
        {address.address_detail}
      </div>
    </div>
  );
}
function AddressListDialogContent() {
  const [loading, setLoading] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const getAddressList = async () => {
    try {
      setLoading(true);
      const result = await userApi.getAllUserAddress();
      setAddressList(result.data.newAllUserAddress);
    } catch (error) {
      console.log(error);
      toast.error('Có lỗi khi lấy dữ liệu địa chỉ người dùng');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAddressList();
  }, []);

  return (
    <div className="flex flex-col h-auto text-(--color-preset-gray)] gap-4">
      {loading && <SpinnerOverlay />}
      {addressList.map((address) => (
        <AddressBlock address={address} setAddressList={setAddressList} />
      ))}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className={'button-standard-2'}>THÊM ĐỊA CHỈ MỚI +</button>
        </AlertDialogTrigger>
        <AlertDialogContent className={'max-w-300! w-fit'}>
          <AddressForm mode={'creating'} />
          <AlertDialogCancel
            className={'absolute top-5 right-5 border-none hover:text-red-500'}
          >
            X
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function AddressBlock({ address, setAddressList }) {
  console.log('A: ', address);
  const { getDefaultAddress } = useContext(LocalContext);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const handleOnEdit = async (formData) => {
    try {
      const response = await userApi.updateUserAddress(formData);
      const addressList = response.data.newAllUserAddress;
      addressList.sort((a, b) => Number(b.isActive) - Number(a.isActive));
      setAddressList(addressList);
      toast.success('Cập nhật địa chỉ thành công');
      setShowEditDialog(false);
    } catch (error) {
      toast.error('Có lỗi khi cập nhật địa chỉ');
    }
  };
  const handleOnClick = async () => {
    try {
      const result = await userApi.setDefaultOfUserAddress(address.addressId);
      toast.success('Cập nhật địa chỉ giao hàng thành công');
      await getDefaultAddress();
    } catch (error) {
      console.log(error);
      toast.error('');
    }
  };
  return (
    <div key={address.addressId} className="address-block w-full! max-w-full!">
      <div className="flex justify-between items-center">
        <div className="address-block-contact">
          <div style={{ fontWeight: '700' }}>{address.contact_name}</div>
          <div>|</div>
          <div>{address.contact_phone}</div>
        </div>
        <AlertDialog
          open={showEditDialog}
          onOpenChange={(open) => setShowEditDialog(open)}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-[16px]!"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit style={{ width: '16px', height: '16px' }} /> Sửa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={'max-w-300! w-fit'}>
            <AddressForm
              mode={'editing'}
              initialAddress={address}
              onEditSubmit={handleOnEdit}
            />
            <AlertDialogCancel
              className={
                'absolute top-5 right-5 border-none hover:text-red-500'
              }
            >
              X
            </AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div>
        {`${address.provinceName}, 
        ${address.districtName}, 
        ${address.wardName}`}
      </div>
      <div>{address.address_detail}</div>
      <button
        className={`address-block-default-flag ${
          address.isActive ? 'active' : ''
        }`}
        disabled={address.isActive}
        onClick={handleOnClick}
      >
        <Flag />
        Đặt làm địa chỉ giao hàng
      </button>
    </div>
  );
}

const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-6 mb-4',
};
