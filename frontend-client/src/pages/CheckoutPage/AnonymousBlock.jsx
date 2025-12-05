import { Button } from '@/components/ui/button';
import {
  InputBlock_Input,
  InputBlock_TextArea,
  OrBlock,
} from '@/reusable_components/comps';
import { Ticket, UserRoundCheck } from 'lucide-react';

export default function AnonymousBlock() {
  return (
    <div className={reuseableStyle.block}>
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

        <Button className="text-[14px] font-bold text-white rounded-none! p-6! pl-4! pr-4!">
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
          // inputValue={formData.contact_name}
          // onInputValueChange={(value) => {
          //   setFormdata((prev) => ({
          //     ...prev,
          //     contact_name: value,
          //   }));
          // }}
        />
        <InputBlock_Input
          label={'Số điện thoại người nhận'}
          placeholder={'Nhập số điện thoại'}
          isFormRequired={true}
          // inputValue={formData.contact_phone}
          // onInputValueChange={(value) => {
          //   setFormdata((prev) => ({
          //     ...prev,
          //     contact_phone: value,
          //   }));
          // }}
        />
        <div className=" grid grid-cols-3 gap-4">
          <InputBlock_Input
            label={'Tỉnh/ Thành phố'}
            placeholder={'Nhập số điện thoại'}
            isFormRequired={true}
          />
          <InputBlock_Input
            label={'Quận/ Huyện'}
            placeholder={'Nhập số điện thoại'}
            isFormRequired={true}
          />
          <InputBlock_Input
            label={'Phường/ Xã'}
            placeholder={'Nhập số điện thoại'}
            isFormRequired={true}
          />
        </div>

        <InputBlock_TextArea
          label={'Địa chỉ cụ thể'}
          placeholder={
            'Nhập địa chỉ cụ thể, ví dụ: 329 đường Hải Đức, phường Phương Sơn, Nha Trang, Khánh Hòa'
          }
          // isFormRequired={true}
          // inputValue={formData.address_detail}
          // onInputValueChange={(value) => {
          //   setFormdata((prev) => ({
          //     ...prev,
          //     address_detail: value,
          //   }));
          // }}
        />
      </form>
    </div>
  );
}
const reuseableStyle = {
  block: 'flex flex-col p-6 rounded-1 bg-white shadow-xl',
  blockTitle: 'flex items-center gap-2 text-[16px] font-bold leading-6 mb-4',
};
