import provinceApi from '@/api/provinceApi';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/contexts/zustands/AuthStore';
import {
  InputBlock_Input,
  InputBlock_SelectWithSearch,
  InputBlock_TextArea,
  OrBlock,
} from '@/reusable_components/comps';
import { nameRegex, phoneRegex } from '@/util';
import { Ticket, UserRoundCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AnonymousAddressBlock({
  address,
  setAddress,
  formError,
  setFormError,
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();
  const [allProvinces, setAllProvinces] = useState([]);
  const [allDistrictsOfProvince, setAllDistrictsOfProvince] = useState([]);
  const [allWardsOfDistrict, setAllWardOfDistrict] = useState([]);

  const getAllProvinces = async () => {
    try {
      const response = await provinceApi.getAllProvinces();
      const allProvinces = response.data.data;
      setAllProvinces(allProvinces);
    } catch (error) {
      console.log(error);
      toast.error('Lấy dữ liệu tỉnh thành thất bại');
    }
  };
  const getAllDistrictsOfProvince = async (provinceId) => {
    try {
      const response = await provinceApi.getAllDistrictOfProvince(provinceId);
      setAllDistrictsOfProvince(response.data.data);
    } catch (error) {
      toast.error('Lấy dữ liệu quận/ huyện thất bại');
    }
  };
  const getAllWardsOfDistrict = async (districtId) => {
    try {
      const response = await provinceApi.getAllWardOfDistrict(districtId);
      setAllWardOfDistrict(response.data.data);
    } catch (error) {
      toast.error('Lấy dữ liệu xã/ phường thất bại');
    }
  };
  const handleOnProvinceSelect = async (provinceId) => {
    if (provinceId !== '') {
      getAllDistrictsOfProvince(provinceId);

      // //clear district and ward
      setAllDistrictsOfProvince([]);
      setAllWardOfDistrict([]);

      setAddress((prev) => ({
        ...prev,
        districtCode: '',
        districtName: '',
        wardCode: '',
        wardName: '',
      }));
    }
  };
  const handleOnDistrictSelect = async (districtId) => {
    if (districtId !== '') {
      getAllWardsOfDistrict(districtId);

      // //clear district and ward
      setAllWardOfDistrict([]);
      setAddress((prev) => ({
        ...prev,
        wardCode: '',
        wardName: '',
      }));
    }
  };

  useEffect(() => {
    getAllProvinces();
  }, []);
  useEffect(() => {
    if (address.provinceCode !== '')
      getAllDistrictsOfProvince(address.provinceCode);
  }, [address.provinceCode]);
  useEffect(() => {
    if (address.districtCode !== '')
      getAllWardsOfDistrict(address.districtCode);
  }, [address.districtCode]);

  const checkError = () => {
    const formError = [];
    if (
      !address.contact_name ||
      !address.contact_phone ||
      !address.address_detail ||
      !address.provinceCode | !address.districtCode ||
      !address.wardCode
    ) {
      formError.push('Vui lòng điền đầy đủ các trường');
    }

    if (!nameRegex.test(address.contact_name)) {
      formError.push('Định dạng tên không hợp lệ!');
    }
    if (!phoneRegex.test(address.contact_phone)) {
      formError.push('Định dạng SĐT không hợp lệ!');
    }
    console.log('Form error: ', formError);
    setFormError((prev) => ({
      ...prev,
      AnonymousAddressBlockError: formError,
    }));
  };
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    checkError();
  }, [address]);
  return (
    <div
      className={
        reuseableStyle.block +
        (formError.AnonymousAddressBlockError.length > 0 &&
          reuseableStyle.blockError)
      }
    >
      <span className={reuseableStyle.blockTitle}>
        <UserRoundCheck /> Đăng nhập/ Đăng ký
      </span>
      <div className="grid grid-cols-[7fr_3fr] ">
        <div className="flex flex-col gap-2 mb-5">
          <span>
            Đăng nhập/ Đăng ký để nhận ưu đãi giảm giá thành viên đến 20%
          </span>
          <Button className="w-fit bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">
            <Ticket />
            Giảm 80K cho lần mua sắm đầu tiên
          </Button>
        </div>

        <Button
          className="text-[14px] font-bold text-white rounded-none! p-6! pl-4! pr-4!"
          onClick={() => navigate('/auth/sign-in')}
        >
          ĐĂNG NHẬP/ ĐĂNG KÝ
        </Button>
      </div>
      <OrBlock />
      <span className={reuseableStyle.blockTitle}>
        Mua hàng không đăng nhập
      </span>
      <form className="flex flex-col gap-4">
        <InputBlock_Input
          label={'Họ và tên người nhận'}
          placeholder={'Nhập họ tên'}
          isFormRequired={true}
          inputValue={address.contact_name}
          onInputValueChange={(value) => {
            setAddress((prev) => ({
              ...prev,
              contact_name: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Số điện thoại người nhận'}
          placeholder={'Nhập số điện thoại'}
          isFormRequired={true}
          inputValue={address.contact_phone}
          onInputValueChange={(value) => {
            setAddress((prev) => ({
              ...prev,
              contact_phone: value,
            }));
          }}
        />
        <div className=" grid grid-cols-3 gap-4">
          <InputBlock_SelectWithSearch
            label={'Tỉnh/ Thành phố'}
            selectValue={address.provinceCode}
            onInputValueChange={(selectedId) => {
              const matching = allProvinces.find(
                (province) => province.id === selectedId
              );
              handleOnProvinceSelect(selectedId);
              setAddress((prev) => ({
                ...prev,
                provinceCode: selectedId,
                provinceName: matching.name,
              }));
            }}
            placeholder={'Chọn tỉnh/ thành phố'}
            selectValueList={allProvinces}
          />
          <InputBlock_SelectWithSearch
            label={'Quận/ Huyện'}
            selectValue={address.districtCode}
            selectValueList={allDistrictsOfProvince}
            onInputValueChange={(selectedId) => {
              const matching = allDistrictsOfProvince.find(
                (district) => district.id === selectedId
              );

              handleOnDistrictSelect(selectedId);
              setAddress((prev) => ({
                ...prev,
                districtCode: selectedId,
                districtName: matching.name,
              }));
            }}
            placeholder={'Chọn quận/ huyện'}
            isDisabled={address.provinceCode === ''}
          />
          <InputBlock_SelectWithSearch
            label={'Phường/ Xã'}
            selectValue={address.wardCode}
            selectValueList={allWardsOfDistrict}
            onInputValueChange={(selectedId) => {
              const matching = allWardsOfDistrict.find(
                (ward) => ward.id === selectedId
              );

              setAddress((prev) => ({
                ...prev,
                wardCode: selectedId,
                wardName: matching.name,
              }));
            }}
            placeholder={'Chọn phường/ xã'}
            isDisabled={!address.districtCode}
          />
        </div>

        <InputBlock_TextArea
          label={'Địa chỉ cụ thể'}
          placeholder={
            'Nhập địa chỉ cụ thể, ví dụ: 329 đường Hải Đức, phường Phương Sơn, Nha Trang, Khánh Hòa'
          }
          isFormRequired={true}
          inputValue={address.address_detail}
          onInputValueChange={(value) => {
            setAddress((prev) => ({
              ...prev,
              address_detail: value,
            }));
          }}
        />
      </form>
      {formError.AnonymousAddressBlockError.length > 0 && (
        <ul
          style={{
            marginTop: '12px',
            marginBottom: '-4px',
            marginLeft: '20px',
          }}
          className="ul-error"
        >
          {formError.AnonymousAddressBlockError.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl ',
  blockError: ' border border-red-500 bg-red-500 ',
  blockTitle: ' flex items-center gap-2 text-[16px] font-bold leading-6 mb-4 ',
};
