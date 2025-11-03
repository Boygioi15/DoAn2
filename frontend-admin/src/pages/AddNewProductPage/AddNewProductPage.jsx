import { Input } from "@/components/ui/input";
import { InputBlock_Input } from "@/reuseables/Input";

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[12px] pt-[20px] gap-[20px] rounded-[4px] bg-[white]",
};
export default function AddNewProductPage() {
  return (
    <div className="page-layout">
      <h1>Thêm sản phẩm mới</h1>
      <div className="flex flex-col gap-[20px]">
        <div className={reusableStyle.inputBlock}>
          <h2>Thông tin cơ bản</h2>
          <div className="flex flex-row gap-[20px]">
            <div className="w-[420px] h-[400px] bg-[gray]"></div>
            <div className="w-[100%] flex flex-col gap-[20px]">
              <InputBlock_Input
                label="Tên sản phẩm"
                description="Tiêu đề nhiều ngôn ngữ sẽ được hiển thị khi người mua thay đổi cài đặt ngôn ngữ mặc định của ứng dụng của họ. Thiết lập nó có thể giúp cải thiện việc thu hồi sản phẩm trong các ứng dụng nhắm mục tiêu vào các ngôn ngữ khác nhau."
                isRequired={true}
                placeholder="Nhập tên sản phẩm"
              />
              <InputBlock_Input
                label="Danh mục sản phẩm"
                isRequired={true}
                placeholder="Nhập danh mục sản phẩm"
              />
            </div>
          </div>
        </div>

        <div className={reusableStyle.inputBlock}>
          <h2>Đặc tính sản phẩm</h2>
          <div className="flex flex-row gap-[20px]">
            <div className="w-[420px] h-[400px] bg-[gray]"></div>
            <div className="w-[100%] flex flex-col gap-[20px]">
              <InputBlock_Input
                label="Tên sản phẩm"
                description="Tiêu đề nhiều ngôn ngữ sẽ được hiển thị khi người mua thay đổi cài đặt ngôn ngữ mặc định của ứng dụng của họ. Thiết lập nó có thể giúp cải thiện việc thu hồi sản phẩm trong các ứng dụng nhắm mục tiêu vào các ngôn ngữ khác nhau."
                isRequired={true}
                placeholder="Nhập tên sản phẩm"
              />
              <InputBlock_Input
                label="Danh mục sản phẩm"
                isRequired={true}
                placeholder="Nhập danh mục sản phẩm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
