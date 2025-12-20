import { useContext } from "react";
import { AddNewProductPageContext } from "../AddNewProductPage";
import { InputBlock_Input } from "@/reusable-component/Input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ComboBoxWithSearch from "@/reusable-component/ComboboxWithSearch";
import UploadComponent from "@/reusable-component/UploadComponent";

export default function BasicInfoBlock() {
  const addProductHook = useContext(AddNewProductPageContext);
  return (
    <div
      ref={addProductHook.basicInfoRef}
      onClick={() => addProductHook.setTipState(1)}
    >
      <div
        className={
          reusableStyle.inputBlock +
          (addProductHook.formErrors.basicInfoError.length > 0 &&
            reusableStyle.errorBorder)
        }
      >
        <h2>Thông tin cơ bản</h2>
        <div className="flex flex-row gap-10">
          <div className="w-[70%] flex flex-col gap-5">
            <InputBlock_Input
              inputId={"basicinfo-name"}
              label="Tên sản phẩm"
              description="Tiêu đề nhiều ngôn ngữ sẽ được hiển thị khi người mua thay đổi cài đặt ngôn ngữ mặc định của ứng dụng của họ. Thiết lập nó có thể giúp cải thiện việc thu hồi sản phẩm trong các ứng dụng nhắm mục tiêu vào các ngôn ngữ khác nhau."
              isRequired={true}
              placeholder="Nhập tên sản phẩm"
              value={addProductHook.productName}
              onInputValueChange={(e) =>
                addProductHook.setProductName(e.target.value)
              }
            />
            <div className="grid gap-2">
              <Label className="gap-1 text-[14px]">
                <span className="text-destructive">*</span>Chọn ngành hàng
              </Label>
              <ComboBoxWithSearch
                textPlaceholder="Chọn ngành hàng cho sản phẩm"
                optionPlaceHolder="Tìm kiếm ngành hàng"
                comboboxValue={addProductHook.selectedCategory}
                comboboxValueList={addProductHook.allSelectableCategories.map(
                  (category) => ({
                    id: category.categoryId,
                    display: buildCategoryNameRecursively(
                      category,
                      allCategories
                    ),
                  })
                )}
                onValueChange={(value) =>
                  addProductHook.setSelectedCategory(value)
                }
              />
            </div>

            {addProductHook.formErrors.basicInfoError.length > 0 && (
              <ul
                style={{ marginTop: "0px", marginBottom: "-4px" }}
                className="ul-error"
              >
                {addProductHook.formErrors.basicInfoError.map(
                  (element, idx) => (
                    <li key={idx}>{element}</li>
                  )
                )}
              </ul>
            )}
          </div>
          <div className="w-[30%] flex flex-col gap-2.5">
            <h2>Ảnh bìa sản phẩm</h2>
            <UploadComponent
              initialImageUrl={
                "https://res.cloudinary.com/ddrfocetn/image/upload/v1764348014/do-an-2/skiqidgwwbahxdnliccf.webp"
              }
              uploadComponentId={"basicinfo-thumbnail"}
              className="h-full"
              onImageChange={(file) => addProductHook.setThumbnailFile(file)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
