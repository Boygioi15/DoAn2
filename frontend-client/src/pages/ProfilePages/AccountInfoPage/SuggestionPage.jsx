import { useContext, useEffect, useState } from 'react';
import './AccountInfoPage.css';
import '../ProfilePage.css';
import { ProfileContext } from '../../../contexts/ProfileContext';
import userApi from '../../../api/userApi';
import { toast } from 'sonner';

import {
  InputBlock_Input,
  InputBlock_Select,
  InputBlock_TextArea,
} from '../../../reusable_components/comps';
import { UltilityContext_1 } from '@/contexts/UltilityContext_1';

export default function SuggestionPage() {
  const { convenience_1 } = useContext(UltilityContext_1);
  const { setSelectedTab } = useContext(ProfileContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const genderOptions = ['Nam', 'Nữ', 'Khác'];

  const [formData, setFormData] = useState({
    gender: 'Nam',
    categoryName: '',
    userPrompt: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const _formErrors = [];

    if (!formData.categoryName.trim()) {
      _formErrors.push('Vui lòng nhập tên danh mục!');
    }
    if (!formData.userPrompt.trim()) {
      _formErrors.push('Vui lòng nhập nội dung gợi ý!');
    }

    if (_formErrors.length > 0) {
      setFormErrors(_formErrors);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    try {
      await userApi.submitSuggestion(formData);
      toast.success('Gửi gợi ý thành công!');
      // Reset form after successful submission
      setFormData({
        gender: 'Nam',
        categoryName: '',
        userPrompt: '',
      });
    } catch (error) {
      toast.error('Gửi gợi ý thất bại!');
      if (error.response?.data?.message) {
        setFormErrors([error.response.data.message]);
      }
      if (error.authError) {
        convenience_1();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setSelectedTab(2); // Set appropriate tab index for suggestion page
  }, []);

  return (
    <div className="ProfilePage">
      <div className="ProfilePage_Title_Block">
        <div className="ProfilePage_Title">GỢI Ý SẢN PHẨM</div>
        <div className="ProfilePage_Description">
          Gửi gợi ý để chúng tôi có thể đề xuất sản phẩm phù hợp với bạn
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="account-info-table">
          <InputBlock_Select
            label={'Giới tính'}
            selectValue={formData.gender}
            selectValueList={genderOptions}
            onInputValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                gender: value,
              }));
            }}
          />

          <InputBlock_Input
            label={'Tên danh mục'}
            placeholder={'Nhập tên danh mục sản phẩm...'}
            inputValue={formData.categoryName}
            onInputValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                categoryName: value,
              }));
            }}
            isFormRequired={true}
          />

          <InputBlock_TextArea
            label={'Nội dung gợi ý'}
            placeholder={'Mô tả chi tiết nhu cầu của bạn...'}
            inputValue={formData.userPrompt}
            onInputValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                userPrompt: value,
              }));
            }}
            isFormRequired={true}
          />
        </div>

        {formErrors.length > 0 && (
          <ul
            style={{ marginTop: '20px', marginBottom: '-4px' }}
            className="ul-error"
          >
            {formErrors.map((element, idx) => (
              <li key={idx}>{element}</li>
            ))}
          </ul>
        )}

        <div className="account-info-button-block">
          <button
            type="submit"
            className="button-standard-1"
            style={{ flexGrow: 1, marginTop: '16px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi gợi ý'}
          </button>
        </div>
      </form>
    </div>
  );
}
