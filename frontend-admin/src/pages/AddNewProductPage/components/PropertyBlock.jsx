import { Input } from "@/components/ui/input";
import { EditProductPageContext } from "../EditProductPage";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useContext } from "react";

export default function PropertyBlock({}) {
  const addProductContext = useContext(EditProductPageContext);
  return (
    <div
      className={
        reusableStyle.inputBlock +
        (addProductContext.formErrors.propertyListError.length > 0 &&
          reusableStyle.errorBorder)
      }
    >
      <h2>Đặc tính sản phẩm</h2>
      <div className="flex flex-col gap-5">
        {addProductContext.propertyList.map((productProperty, index) => (
          <div key={index} className="flex flex-row gap-3 items-center">
            <Input
              id={`property-i-${index}`}
              className="w-[40%]"
              placeholder={"Tên thuộc tính"}
              value={productProperty.name}
              onChange={(e) => {
                const newList = [...addProductContext.propertyList];
                newList[index].name = e.target.value;
                addProductContext.setProductPropertyList(newList);
              }}
            />
            <span>:</span>
            <Input
              id={`property-v-${index}`}
              placeholder={"Giá trị"}
              value={productProperty.value}
              onChange={(e) => {
                //check if there is any product property with matching name?
                const newList = [...addProductContext.propertyList];
                newList[index].value = e.target.value;
                addProductContext.setProductPropertyList(newList);
              }}
            />
            <Button
              onClick={() => {
                addProductContext.setProductPropertyList((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
              variant={"destructive"}
              disabled={addProductContext.propertyList.length <= 1}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={addProductContext.addNewProperty}
        variant="outline"
        id={"add-new-property"}
      >
        Thêm thuộc tính mới
      </Button>
      {addProductContext.formErrors.propertyListError.length > 0 && (
        <ul style={{ marginBottom: "-4px" }} className="ul-error">
          {addProductContext.formErrors.propertyListError.map(
            (element, idx) => (
              <li key={idx}>{element}</li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg ",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
