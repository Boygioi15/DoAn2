import { useContext } from "react";
import { EditProductPageContext } from "../EditProductPage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Menu, Trash, Trash2Icon } from "lucide-react";
import { InputBlock_Input } from "@/reusable-component/Input";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FileUploadCompact from "@/components/compact-upload";
import { v4 } from "uuid";
export default function VariantListBlock() {
  const addProductContext = useContext(EditProductPageContext);
  //   const createNewVariant = () => {
  //     const newVariant = {
  //       index: total,
  //       name: "",
  //       valueList: [
  //         {
  //           name: "",
  //           img: [],
  //           tempId: v4(),
  //         },
  //       ],
  //     };
  //     if (total === 0) {
  //       setVariant1(newVariant);
  //     }
  //     if (total === 1) {
  //       setVariant2(newVariant);
  //     }
  //     return;
  //   };
  return (
    <div
      className={
        `${reusableStyle.inputBlock}` +
        (addProductContext.edit &&
          addProductContext.initialProductData &&
          !addProductContext.initialProductData.isDrafted &&
          " opacity-90 pointer-events-none")
      }
    >
      <div className="flex flex-row justify-between items-center ">
        <h2>Biến thể sản phẩm</h2>
        {addProductContext.edit &&
          addProductContext.initialProductData &&
          !addProductContext.initialProductData.isDrafted && (
            <h6 className="text-muted-foreground">Chế độ cập nhật - cố định</h6>
          )}
      </div>
      <h6>
        Tạo biến thể cho sản phẩm, hiện cố định 2 biến thể là màu sắc và kích cỡ
      </h6>
      {addProductContext.variant1 && (
        <VariantBlock
          variant={addProductContext.variant1}
          onVariantChange={(newVariant) => {
            addProductContext.setVariant1(newVariant);
            addProductContext.generateVariantDetailFromVariant(
              newVariant,
              addProductContext.variant2
            );
          }}
          errors={addProductContext.formErrors.variant1Error}
        />
      )}
      {addProductContext.variant2 && (
        <VariantBlock
          variant={addProductContext.variant2}
          onVariantChange={(newVariant) => {
            addProductContext.setVariant2(newVariant);
            addProductContext.generateVariantDetailFromVariant(
              addProductContext.variant1,
              newVariant
            );
            addProductContext.generateNewSizeGuidanceDataFromVariant(
              newVariant
            );
          }}
          errors={addProductContext.formErrors.variant2Error}
        />
      )}
      {/* {total < 2 && (
        <Button
          variant={"outline"}
          className="w-fit"
          onClick={createNewVariant}
        >
          + Thêm biến thể mới{` (${total}/2)`}
        </Button>
      )} */}
    </div>
  );
}
function VariantBlock({ variant, initialImageUrls, onVariantChange, errors }) {
  return (
    <div className={reusableStyle.variantBlock}>
      <div className="flex justify-between items-center">
        <h2>Biến thể {variant.index + 1}</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"ghost"} disabled>
              <Trash />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={"max-w-[300px]"}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Bạn có chắc chắn muốn xóa biến thể này?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này là không thể khôi phục được!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onVariantChange(null);
                }}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <InputBlock_Input
        label="Tên biến thể"
        isRequired={true}
        placeholder={"Nhập tên biến thể"}
        inputValue={variant.name}
        onInputValueChange={(e) =>
          onVariantChange((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
        containerClassname={"max-w-[70%]"}
        disabled
      />
      <div className="flex flex-col gap-4 max-w-[100%]">
        <Label>Danh sách biến thể</Label>
        {variant.valueList.map((variantValue, index) => (
          <div
            key={index}
            className="flex gap-4 p-2 pl-4  bg-white shadow-sm rounded-lg items-center justify-between"
            id={`option-value-${variant.index}-${index}`}
          >
            <Input
              placeholder="Nhập biến thể mới"
              className={"max-w-[30%]"}
              value={variantValue.name}
              onChange={(e) => {
                const newValueList = variant.valueList;
                if (index === newValueList.length - 1) {
                  newValueList.push({ name: "", img: [], tempId: v4() });
                }
                newValueList[index].name = e.target.value;
                onVariantChange({ ...variant, valueList: newValueList });
              }}
            />
            {/* gallery*/}
            {variantValue.name.length > 0 && variant.index === 0 && (
              <FileUploadCompact
                initialImageUrls={variantValue.initialImage}
                onFilesChange={(files) => {
                  const newValueList = variant.valueList;
                  const currentValue = newValueList[index];
                  currentValue.img = files;
                  onVariantChange({ ...variant, valueList: newValueList });
                }}
                maxFiles={12}
                className={"grow"}
              />
            )}
            {variantValue.name.length > 0 && (
              <div className="flex">
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    let newValueList = [...variant.valueList];
                    newValueList = newValueList.filter(
                      (value, _index) => _index !== index
                    );
                    onVariantChange({ ...variant, valueList: newValueList });
                  }}
                >
                  <Trash2Icon />
                </Button>
                <Button variant={"ghost"}>
                  <Menu />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      {errors.length > 0 && (
        <ul
          style={{ marginTop: "0px", marginBottom: "-4px" }}
          className="ul-error"
        >
          {errors.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
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
