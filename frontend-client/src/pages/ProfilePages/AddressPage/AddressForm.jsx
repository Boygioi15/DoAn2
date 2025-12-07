import provinceApi from '@/api/provinceApi';
import {
  InputBlock_Date,
  InputBlock_Input,
  InputBlock_Select,
  InputBlock_SelectWithSearch,
  InputBlock_TextArea,
} from '@/reusable_components/comps';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { all } from 'axios';
import { nameRegex, phoneRegex } from '@/util';

export default function AddressForm({
  mode,
  initialAddress,
  onCreateSubmit,
  onEditSubmit,
}) {
  const [formData, setFormdata] = useState(
    initialAddress || {
      contact_name: '',
      contact_phone: '',
      address_detail: '',
    }
  );
  console.log('I: ', initialAddress);
  const formFinalFormdata = () => {
    const finalFormData = formData;
    const province = allProvinces.find(
      (province) => province.id === selectedProvinceId
    );
    const district = allDistrictsOfProvince.find(
      (district) => district.id === selectedDistrictId
    );
    const ward = allWardsOfDistrict.find((ward) => ward.id === selectedWardId);
    console.log(province, district, ward);
    finalFormData.provinceCode = Number(province.id);
    finalFormData.provinceName = province.name;
    finalFormData.districtCode = Number(district.id);
    finalFormData.districtName = district.name;
    finalFormData.wardCode = Number(ward.id);
    finalFormData.wardName = ward.name;
    return finalFormData;
  };

  const [formdataErrors, setFormdataErrors] = useState([]);
  const [allProvinces, setAllProvinces] = useState([]);
  const [allDistrictsOfProvince, setAllDistrictsOfProvince] = useState([]);
  const [allWardsOfDistrict, setAllWardOfDistrict] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(
    (initialAddress && initialAddress.provinceCode) || ''
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    (initialAddress && initialAddress.districtCode) || ''
  );
  const [selectedWardId, setSelectedWardId] = useState(
    (initialAddress && initialAddress.wardCode) || ''
  );

  //update provinces, districts & wards
  //fetch all provinces at first
  const getAllProvinces = async () => {
    try {
      const response = await provinceApi.getAllProvinces();
      const allProvinces = response.data.data;
      setAllProvinces(response.data.data);
    } catch (error) {
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

      setSelectedDistrictId('');
      setSelectedWardId('');
    }
  };
  const handleOnDistrictSelect = async (districtId) => {
    if (districtId !== '') {
      getAllWardsOfDistrict(districtId);

      // //clear district and ward
      setAllWardOfDistrict([]);
      setSelectedWardId('');
    }
  };
  useEffect(() => {
    getAllProvinces();
  }, []);
  useEffect(() => {
    if (selectedProvinceId !== '')
      getAllDistrictsOfProvince(selectedProvinceId);
  }, [selectedProvinceId]);
  useEffect(() => {
    if (selectedDistrictId !== '') getAllWardsOfDistrict(selectedDistrictId);
  }, [selectedDistrictId]);
  const handleOnSubmit = (e) => {
    e.preventDefault();
    const finalFormData = formFinalFormdata();
    console.log('Formdata: ', finalFormData);
    const formErrors = [];
    if (
      !finalFormData.contact_name ||
      !finalFormData.contact_phone ||
      !finalFormData.address_detail ||
      !finalFormData.provinceCode | !finalFormData.districtCode ||
      !finalFormData.wardCode
    ) {
      formErrors.push('Vui lòng điền đầy đủ các trường');
    }

    if (!nameRegex.test(finalFormData.contact_name)) {
      formErrors.push('Định dạng tên không hợp lệ!');
    }
    if (!phoneRegex.test(finalFormData.contact_phone)) {
      formErrors.push('Định dạng SĐT không hợp lệ!');
    }
    console.log('Form error: ', formErrors);
    setFormdataErrors(formErrors);
    if (formErrors.length > 0) {
      return;
    }
    if (mode === 'creating') {
      console.log(finalFormData);
      onCreateSubmit(finalFormData);
    } else {
      onEditSubmit(finalFormData);
    }
  };
  return (
    <form className="address-form" onSubmit={handleOnSubmit}>
      <div className="text-[18px] text-center font-semibold flex flex-col gap-[12px]">
        <div>
          {mode === 'creating' ? 'Thêm mới địa chỉ' : 'Cập nhật địa chỉ'}
        </div>
        <div className="w-full h-[1px] bg-[var(--color-preset-border-color)]" />
      </div>
      <div style={addressFormLineStyle}>
        <InputBlock_Input
          label={'Họ và tên người nhận'}
          placeholder={'Nhập họ tên'}
          isFormRequired={true}
          inputValue={formData.contact_name}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              contact_name: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Số điện thoại người nhận'}
          inputValue={formData.contact_phone}
          placeholder={'Nhập số điện thoại'}
          isFormRequired={true}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              contact_phone: value,
            }));
          }}
        />
      </div>
      <div style={addressFormLineStyle}>
        <InputBlock_SelectWithSearch
          label={'Tỉnh/ Thành phố'}
          selectValue={selectedProvinceId}
          onInputValueChange={(selectedId) => {
            handleOnProvinceSelect(selectedId);
            setSelectedProvinceId(selectedId);
          }}
          placeholder={'Chọn tỉnh/ thành phố'}
          selectValueList={allProvinces}
        />
        <InputBlock_SelectWithSearch
          label={'Quận/ Huyện'}
          selectValue={selectedDistrictId}
          selectValueList={allDistrictsOfProvince}
          onInputValueChange={(selectedId) => {
            handleOnDistrictSelect(selectedId);
            setSelectedDistrictId(selectedId);
          }}
          placeholder={'Chọn quận/ huyện'}
          isDisabled={selectedProvinceId === ''}
        />
        <InputBlock_SelectWithSearch
          label={'Phường/ Xã'}
          selectValue={selectedWardId}
          selectValueList={allWardsOfDistrict}
          onInputValueChange={(selectedId) => {
            setSelectedWardId(selectedId);
          }}
          placeholder={'Chọn phường/ xã'}
          isDisabled={!selectedDistrictId}
        />
      </div>
      <InputBlock_TextArea
        label={'Địa chỉ cụ thể'}
        placeholder={
          'Nhập địa chỉ cụ thể, ví dụ: 329 đường Hải Đức, phường Phương Sơn, Nha Trang, Khánh Hòa'
        }
        isFormRequired={true}
        inputValue={formData.address_detail}
        onInputValueChange={(value) => {
          setFormdata((prev) => ({
            ...prev,
            address_detail: value,
          }));
        }}
      />
      {formdataErrors.length > 0 && (
        <ul className="ul-error">
          {formdataErrors.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
      <button className="button-standard-1">Xác nhận</button>
    </form>
  );
}

const addressFormLineStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',
};
