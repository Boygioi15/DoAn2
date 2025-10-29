import {
  InputBlock_Date,
  InputBlock_Input,
  InputBlock_Select,
  InputBlock_TextArea,
} from '@/reusable_components/comps';
import { useState } from 'react';

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
      address: '',
    }
  );
  const [formdataErrors, setFormdataErrors] = useState([
    'Haha, gà quá',
    '???? Troll à',
  ]);
  return (
    <div className="address-form">
      <div className="text-[18px] text-center font-semibold flex flex-col gap-[12px]">
        <div>
          {mode === 'creating' ? 'Thêm mới địa chỉ' : 'Cập nhật địa chỉ'}
        </div>
        <div className="w-full h-[1px] bg-[var(--color-preset-border-color)]" />
      </div>

      <div style={addressFormLineStyle}>
        <InputBlock_Input
          label={'Họ và tên người nhận'}
          value={formData.contact_name || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              contact_name: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Số điện thoại người nhận'}
          value={formData.contact_phone || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              remindName: value,
            }));
          }}
        />
      </div>
      <div style={addressFormLineStyle}>
        <InputBlock_Input
          label={'Tỉnh/ Thành phố'}
          value={formData.contact_phone || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              remindName: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Quận/ Huyện'}
          value={formData.contact_phone || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              remindName: value,
            }));
          }}
        />
        <InputBlock_Input
          label={'Phường/ Xã'}
          value={formData.contact_phone || ''}
          onInputValueChange={(value) => {
            setFormdata((prev) => ({
              ...prev,
              remindName: value,
            }));
          }}
        />
      </div>
      <InputBlock_TextArea
        label={'Phường/ Xã'}
        value={formData.contact_phone || ''}
        onInputValueChange={(value) => {
          setFormdata((prev) => ({
            ...prev,
            remindName: value,
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

      <button
        className="button-standard-1"
        onClick={() => {
          if (mode === 'creating') {
            onCreateSubmit();
          } else {
            onEditSubmit();
          }
        }}
      >
        Xác nhận
      </button>
    </div>
  );
}

const addressFormLineStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '12px',
};
