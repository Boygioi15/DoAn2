import FileUploadCompact from "@/components/compact-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputBlock_Input } from "@/reuseables/Input";
import UploadComponent from "@/reuseables/UploadComponent";
import { Menu, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[12px] pt-[20px] gap-[20px] rounded-[4px] bg-[white] w-full h-auto",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
};
export default function AddNewProductPage() {
  const [productName, setProductName] = useState("");
  const [productProperties, setProductProperties] = useState([
    { name: "", value: "" },
  ]);
  const [variant1, setVariant1] = useState(null);
  const [variant2, setVariant2] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const addNewProperty = () => {
    setProductProperties((prev) => [...prev, { name: "", value: "" }]);
  };
  useEffect(() => {
    console.log(productProperties);
  }, [productProperties]);
  return (
    <div className="page-layout">
      <h1>Thêm sản phẩm mới</h1>
      {/* Big layout!*/}
      {/*Content*/}
      <div className=" flex flex-col gap-[20px]">
        <div className={reusableStyle.inputBlock}>
          <h2>Thông tin cơ bản</h2>
          <div className="flex flex-row gap-[40px]">
            <div className="w-[70%] flex flex-col gap-[20px]">
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
            <div className="w-[30%] flex flex-col gap-[10px]">
              <h2>Ảnh bìa sản phẩm</h2>
              <UploadComponent className="h-full" />
            </div>
          </div>
        </div>
        <PropertiesBlock
          properties={productProperties}
          setProperties={setProductProperties}
          onAddNewProperty={addNewProperty}
        />
        <DescriptionBlock />
        <VariantAndSellingBlock
          variant1={variant1}
          variant2={variant2}
          setVariant1={setVariant1}
          setVariant2={setVariant2}
        />
      </div>
    </div>
  );
}
function DescriptionBlock({
  description,
  onDescriptionChange,
  onAddNewProperty,
}) {
  return (
    <div id="editor" className={reusableStyle.inputBlock}>
      <h2>Mô tả sản phẩm</h2>
      <ReactQuill
        theme="snow"
        value={"value"}
        onChange={onDescriptionChange}
        className="flex flex-col min-h-[400px] max-h-[400px] overflow-clip pb-45px"
      />
    </div>
  );
}
function PropertiesBlock({ properties, setProperties, onAddNewProperty }) {
  return (
    <div className={`${reusableStyle.inputBlock}`}>
      <h2>Đặc tính sản phẩm</h2>
      <div className="flex flex-col gap-[20px]">
        {properties.map((productProperty, index) => (
          <div key={index} className="flex flex-row gap-[12px] items-center">
            <Input
              className="w-[40%]"
              placeholder={"Tên thuộc tính"}
              value={productProperty.name}
              onChange={(e) => {
                //check if there is any product property with matching name?
                const matchedProduct = properties.find(
                  (property) => property.name === e.target.value
                );
                if (matchedProduct) {
                  setFormErrors((prev) => [
                    ...prev,
                    "Các thuộc tính không được trùng tên nhau!",
                  ]);
                }
                const newList = [...properties];
                newList[index].name = e.target.value;
                setProperties(newList);
              }}
            />
            <span>:</span>
            <Input
              placeholder={"Giá trị"}
              value={productProperty.value}
              onChange={(e) => {
                //check if there is any product property with matching name?
                const newList = [...properties];
                newList[index].value = e.target.value;
                setProperties(newList);
              }}
            />
            <Button
              onClick={() => {
                setProperties((prev) => prev.filter((_, i) => i !== index));
              }}
              variant={"destructive"}
              disabled={properties.length <= 1}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={onAddNewProperty} variant="outline">
        Thêm thuộc tính mới
      </Button>
      <div className="flex flex-row gap-[20px]"></div>
    </div>
  );
}
function VariantAndSellingBlock({
  variant1,
  variant2,
  setVariant1,
  setVariant2,
}) {
  let total = 0;
  if (variant1) total++;
  if (variant2) total++;
  const createNewVariant = () => {
    const newVariant = {
      index: total,
      name: "",
      valueList: [
        {
          name: "",
          img: [],
        },
      ],
    };
    if (total === 0) {
      setVariant1(newVariant);
    }
    if (total === 1) {
      setVariant2(newVariant);
    }
    return;
  };

  return (
    <div className={`${reusableStyle.inputBlock}`}>
      <h2>Giá bán, kho hàng và biến thể</h2>
      <h6>
        Tạo biến thể nếu sản phẩm có hơn một tùy chọn, ví dụ như về kích thước
        hay màu sắc.
      </h6>
      {variant1 && <VariantBlock variant={variant1} setVariant={setVariant1} />}
      {variant2 && <VariantBlock variant={variant2} />}
      {total < 2 && (
        <Button
          variant={"outline"}
          className="w-fit"
          onClick={createNewVariant}
        >
          + Thêm biến thể mới{` (${total}/2)`}
        </Button>
      )}
    </div>
  );
}
function VariantBlock({ variant, setVariant }) {
  return (
    <div className={reusableStyle.variantBlock}>
      <h2>Biến thể {variant.index + 1}</h2>
      <InputBlock_Input
        label="Tên biến thể"
        isRequired={true}
        placeholder={"Nhập tên biến thể"}
        inputValue={variant.name}
        onInputValueChange={(e) =>
          setVariant((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
        containerClassname={"max-w-[70%]"}
      />
      <div className="flex flex-col gap-4 max-w-[70%]">
        <Label>Danh sách biến thể</Label>
        {variant.valueList.map((variantValue, index) => (
          <div className="flex gap-4 p-2 pl-4  bg-white shadow-sm rounded-[4px] items-center">
            <Input
              placeholder="Nhập biến thể mới"
              className={"max-w-[30%]"}
              value={variantValue.name}
              onChange={(e) => {
                const newValueList = variant.valueList;
                if (index === newValueList.length - 1) {
                  newValueList.push({ name: "", img: [] });
                }
                newValueList[index].name = e.target.value;
                setVariant({ ...variant, valueList: newValueList });
              }}
            />
            {/* gallery*/}
            {variantValue.name.length > 0 && (
              <FileUploadCompact
                onFilesChange={(files) => {
                  console.log(files);
                }}
                maxFiles={6}
                className={"grow"}
              />
            )}
            {variantValue.name.length > 0 && (
              <div className="flex">
                <Button variant={"ghost"}>
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
    </div>
  );
}
