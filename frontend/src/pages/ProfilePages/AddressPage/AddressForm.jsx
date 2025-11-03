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

  const formFinalFormdata = () => {
    const finalFormData = formData;
    if (initialAddress) {
      finalFormData.provinceCode = initialAddress.provinceCode;
      finalFormData.provinceName = initialAddress.provinceName;
      finalFormData.districtCode = initialAddress.districtCode;
      finalFormData.districtName = initialAddress.districtName;
      finalFormData.wardCode = initialAddress.wardCode;
      finalFormData.wardName = initialAddress.wardName;
      return finalFormData;
    }
    finalFormData.provinceCode = selectedProvince?.id;
    finalFormData.provinceName = selectedProvince?.name;
    finalFormData.districtCode = selectedDistrict?.id;
    finalFormData.districtName = selectedDistrict?.name;
    finalFormData.wardCode = selectedWard?.id;
    finalFormData.wardName = selectedWard?.name;
    return finalFormData;
  };

  const [formdataErrors, setFormdataErrors] = useState([]);
  const [allProvinces, setAllProvinces] = useState([]);
  const [allDistrictsOfProvince, setAllDistrictsOfProvince] = useState([]);
  const [allWardsOfDistrict, setAllWardOfDistrict] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

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
  useEffect(() => {
    getAllProvinces();
  }, []);

  //only fetch if province is selceted
  useEffect(() => {
    if (selectedProvince && selectedProvince.id !== '') {
      //fetch district
      getAllDistrictsOfProvince(selectedProvince.id);

      //clear district and ward
      setAllDistrictsOfProvince([]);
      setAllWardOfDistrict([]);

      setSelectedDistrict(null);
      setSelectedWard(null);
    }
  }, [selectedProvince]);
  //only fetch wards if district is selected
  useEffect(() => {
    if (selectedDistrict && selectedDistrict.id !== '') {
      getAllWardsOfDistrict(selectedDistrict.id);

      setAllWardOfDistrict([]);

      setSelectedWard(null);
    }
  }, [selectedDistrict]);
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
    const nameRegex = /^[\p{L}\s'.-]{2,50}$/u;
    const phoneRegex = /^\d{10}$/;
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
        {!initialAddress ? (
          <InputBlock_SelectWithSearch
            label={'Tỉnh/ Thành phố'}
            selectValue={selectedProvince ? selectedProvince.id : ''}
            onInputValueChange={(selectedId) => {
              const matchedProvince = allProvinces.find(
                (province) => province.id === selectedId
              );
              setSelectedProvince(matchedProvince);
            }}
            placeholder={'Chọn tỉnh/ thành phố'}
            selectValueList={allProvinces}
          />
        ) : (
          <InputBlock_Input
            label={'Tỉnh/ Thành phố'}
            inputValue={initialAddress.provinceName}
          />
        )}
        {!initialAddress ? (
          <InputBlock_SelectWithSearch
            label={'Quận/ Huyện'}
            selectValue={selectedDistrict ? selectedDistrict.id : ''}
            selectValueList={allDistrictsOfProvince}
            onInputValueChange={(selectedId) => {
              const matchedDistrict = allDistrictsOfProvince.find(
                (district) => district.id === selectedId
              );
              setSelectedDistrict(matchedDistrict);
            }}
            placeholder={'Chọn quận/ huyện'}
            isDisabled={!selectedProvince}
          />
        ) : (
          <InputBlock_Input
            label={'Quận/ Huyện'}
            inputValue={initialAddress.districtName}
          />
        )}

        {!initialAddress ? (
          <InputBlock_SelectWithSearch
            label={'Phường/ Xã'}
            selectValue={selectedWard ? selectedWard.id : ''}
            onInputValueChange={(selectedId) => {
              const matchedWard = allWardsOfDistrict.find(
                (ward) => ward.id === selectedId
              );
              setSelectedWard(matchedWard);
            }}
            placeholder={'Chọn phường/ xã'}
            selectValueList={allWardsOfDistrict}
            isDisabled={!selectedDistrict || allWardsOfDistrict?.length === 0}
          />
        ) : (
          <InputBlock_Input
            label={'Phường/ Xã'}
            inputValue={initialAddress.wardName}
          />
        )}
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
