import categoryApi from "@/api/categoryApi";
import { productApi } from "@/api/productApi";
import FileUploadCompact from "@/components/compact-upload";
import {
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialog,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugifyOption } from "@/constants";
import ComboBoxWithSearch from "@/reusable-component/ComboboxWithSearch";
import { InputBlock_Input } from "@/reusable-component/Input";
import UploadComponent from "@/reusable-component/UploadComponent";
import { buildCategoryNameRecursively } from "@/utils";
import { Menu, Trash, Trash2Icon } from "lucide-react";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import slugify from "slugify";
import { toast } from "sonner";
import { v4 } from "uuid";
import BasicInfoBlock from "./components/BasicInfoBlock";
import useAddProduct from "@/hooks/useAddProduct";

const variant1Default = {
  index: 0,
  name: "Màu sắc",
  valueList: [
    {
      name: "",
      img: [],
      tempId: v4(),
    },
  ],
};
const variant2Default = {
  index: 1,
  name: "Kích thước",
  valueList: [
    {
      name: "",
      img: [],
      tempId: v4(),
    },
  ],
};

export const AddNewProductPageContext = createContext();
export default function AddNewProductPage() {
  const addProductHook = useAddProduct();
  return (
    <AddNewProductPageContext.Provider value={addProductHook}>
      <div className="page-layout">
        {/* Big layout!*/}
        {/*Content*/}
        <div className="grid grid-cols-[75%_25%] gap-4">
          <div className="flex flex-col gap-6">
            <BasicInfoBlock />
          </div>
          <div className="flex flex-col gap-6 sticky top-5 h-fit">
            <ProgressTracker currentStep={addProductHook.currentStep} />
            <TipBlock state={addProductHook.tipState} />
            <ErrorBlock hasError={addProductHook.hasError} />
          </div>
        </div>
      </div>
    </AddNewProductPageContext.Provider>
  );
}
function DescriptionBlock({ description, setDescription, errors }) {
  return (
    <div
      id="descripton"
      className={
        reusableStyle.inputBlock +
        (errors.length > 0 && reusableStyle.errorBorder)
      }
    >
      <h2>Mô tả sản phẩm</h2>
      <ReactQuill
        theme="snow"
        value={description}
        onChange={setDescription}
        className="flex flex-col min-h-[400px] max-h-[400px] overflow-clip pb-45px"
      />
      {errors.length > 0 && (
        <ul
          style={{ marginTop: "-50px", marginBottom: "-4px" }}
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
function PropertiesBlock({
  properties,
  setProperties,
  onAddNewProperty,
  errors,
}) {
  return (
    <div
      className={
        reusableStyle.inputBlock +
        (errors.length > 0 && reusableStyle.errorBorder)
      }
    >
      <h2>Đặc tính sản phẩm</h2>
      <div className="flex flex-col gap-5">
        {properties.map((productProperty, index) => (
          <div key={index} className="flex flex-row gap-3 items-center">
            <Input
              id={`property-i-${index}`}
              className="w-[40%]"
              placeholder={"Tên thuộc tính"}
              value={productProperty.name}
              onChange={(e) => {
                const newList = [...properties];
                newList[index].name = e.target.value;
                setProperties(newList);
              }}
            />
            <span>:</span>
            <Input
              id={`property-v-${index}`}
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
      <Button
        onClick={onAddNewProperty}
        variant="outline"
        id={"add-new-property"}
      >
        Thêm thuộc tính mới
      </Button>
      {errors.length > 0 && (
        <ul style={{ marginBottom: "-4px" }} className="ul-error">
          {errors.map((element, idx) => (
            <li key={idx}>{element}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-row gap-5"></div>
    </div>
  );
}
function VariantAndSellingBlock({
  variant1,
  variant2,
  setVariant1,
  setVariant2,
  variantSellingPoint,
  setVariantSellingPoint,
  v1Errors,
  v2Errors,
  vTableErrors,
}) {
  let total = 0;
  const v1Exist = variant1 && variant1.valueList.length > 1;
  const v2Exist = variant2 && variant2.valueList.length > 1;
  if (v1Exist) total++;
  if (v2Exist) total++;
  const createNewVariant = () => {
    const newVariant = {
      index: total,
      name: "",
      valueList: [
        {
          name: "",
          img: [],
          tempId: v4(),
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
  const [allPrice, setAllPrice] = useState("");
  const [allStock, setAllStock] = useState("");
  const [allSellerSku, setAllSellerSku] = useState("");

  const setNewVariantSellingPoint_Temp = (newVariantSellingPoint, index) => {
    const newList = [...variantSellingPoint];
    newList[index] = newVariantSellingPoint;
    setVariantSellingPoint(newList);
  };
  const handleSubmitApplyAllToolbar = () => {
    const newVariantSellingPoint = variantSellingPoint.map((variant, index) => {
      const newVariant = { ...variant };
      if (allPrice.trim() !== "") {
        newVariant.sellingPrice = allPrice;
      }
      if (allStock.trim() !== "") {
        newVariant.stock = allStock;
      }
      if (allSellerSku.trim() !== "") {
        newVariant.sellerSku = allSellerSku + `-${index + 1}`;
      }
      return newVariant;
    });
    setVariantSellingPoint(newVariantSellingPoint);
  };
  const handleRefreshApplyAllToolbar = () => {
    setAllPrice("");
    setAllStock("");
    setAllSellerSku("");
  };
  return (
    <div className={`${reusableStyle.inputBlock}`}>
      <h2>Giá bán, kho hàng và biến thể</h2>
      <h6>
        Tạo biến thể nếu sản phẩm có hơn một tùy chọn, ví dụ như về kích thước
        hay màu sắc.
      </h6>
      {variant1 && (
        <VariantBlock
          variant={variant1}
          setVariant={setVariant1}
          errors={v1Errors}
        />
      )}
      {variant2 && (
        <VariantBlock
          variant={variant2}
          setVariant={setVariant2}
          errors={v2Errors}
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
      <h2>Giá bán & Kho hàng </h2>
      {variantSellingPoint.length > 0 ? (
        <div className="space-y-2">
          {total > 0 ? (
            <section className="flex gap-2 *:>m-w-[100px]">
              <Input
                placeholder="Giá"
                value={allPrice}
                id={"all-price"}
                onChange={(e) => setAllPrice(e.target.value)}
              />
              <Input
                placeholder="Kho hàng"
                id={"all-stock"}
                value={allStock}
                onChange={(e) => setAllStock(e.target.value)}
              />
              <Input
                id={"all-seller-sku"}
                placeholder="SellerSku"
                value={allSellerSku}
                onChange={(e) => setAllSellerSku(e.target.value)}
              />
              <Button
                id={"apply-all-submit"}
                onClick={handleSubmitApplyAllToolbar}
              >
                Áp dụng cho tất cả
              </Button>
              <Button
                onClick={handleRefreshApplyAllToolbar}
                variant={"outline"}
              >
                Làm mới
              </Button>
            </section>
          ) : (
            <h6>Trường hợp không có biến thể</h6>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {v1Exist && (
                  <TableHead className="w-[100px]">{variant1.name}</TableHead>
                )}
                {v2Exist && (
                  <TableHead className="w-[100px]">{variant2.name}</TableHead>
                )}
                <TableHead>Giá</TableHead>
                <TableHead>Kho hàng</TableHead>
                <TableHead>SellerSku</TableHead>
                <TableHead className="w-0">Được sử dụng</TableHead>
                <TableHead className="w-0">Mở bán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variantSellingPoint.map((row, index) => (
                <TableRow key={index} className={!row.isInUse && "bg-gray-100"}>
                  {row.v1_name && (
                    <TableCell>
                      <Label>{row.v1_name}</Label>
                    </TableCell>
                  )}
                  {row.v2_name && (
                    <TableCell>
                      <Label>{row.v2_name}</Label>
                    </TableCell>
                  )}
                  <TableCell>
                    <Input
                      value={row.sellingPrice}
                      onChange={(e) => {
                        setNewVariantSellingPoint_Temp(
                          {
                            ...row,
                            sellingPrice: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.stock}
                      onChange={(e) => {
                        setNewVariantSellingPoint_Temp(
                          {
                            ...row,
                            stock: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.sellerSku}
                      onChange={(e) => {
                        setNewVariantSellingPoint_Temp(
                          {
                            ...row,
                            sellerSku: e.target.value,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isInUse}
                      onCheckedChange={(e) => {
                        setNewVariantSellingPoint_Temp(
                          {
                            ...row,
                            isInUse: e,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      disabled={!row.isInUse}
                      checked={row.isOpenToSale}
                      onCheckedChange={(e) => {
                        setNewVariantSellingPoint_Temp(
                          {
                            ...row,
                            isOpenToSale: e,
                          },
                          index
                        );
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {vTableErrors.length > 0 && (
            <ul style={{ marginBottom: "-4px" }} className="ul-error">
              {vTableErrors.map((element, idx) => (
                <li key={idx}>{element}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <h6>Hãy tạo hoàn chỉnh biến thể trước!</h6>
      )}
    </div>
  );
}
function VariantBlock({ variant, setVariant, errors }) {
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
                  setVariant(null);
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
          setVariant((prev) => ({
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
                setVariant({ ...variant, valueList: newValueList });
              }}
            />
            {/* gallery*/}
            {variantValue.name.length > 0 && variant.index === 0 && (
              <FileUploadCompact
                onFilesChange={(files) => {
                  const newValueList = variant.valueList;
                  const currentValue = newValueList[index];
                  currentValue.img = files;
                  setVariant((prev) => ({ ...prev, valueList: newValueList }));
                }}
                maxFiles={6}
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
                    setVariant({ ...variant, valueList: newValueList });
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

const steps = [
  "Thông tin cơ bản",
  "Thuộc tính",
  "Mô tả",
  "Phân loại & Giá bán",
];

const ProgressTracker = ({ currentStep }) => {
  return (
    <div
      className={`flex flex-col w-full gap-4 h-fit ${reusableStyle.inputBlock}`}
    >
      <h2 className="text-blue-500">Tiến độ</h2>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <div key={step} className="flex flex-row items-center gap-2 pl-2">
            <div
              className={
                "w-8 h-8 flex items-center justify-center rounded-full border " +
                (isDone
                  ? "bg-blue-500 text-white border-blue-500"
                  : isActive
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground")
              }
            >
              {index + 1}
            </div>
            <span
              className={
                "text-sm " +
                (isDone || isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground")
              }
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
const TipBlock = ({ state }) => {
  let title = "Tips",
    content = "Các tips hữu dụng sẽ xuất hiện ở đây khi bạn làm việc!";
  if (state === 1) {
    title = "Thông tin cơ bản";
    content =
      "Phần Mô tả sản phẩm cung cấp những thông tin hữu ích về sản phẩm để giúp khách hàng quyết định mua sắm";
  } else if (state === 2) {
    title = "Đặc tính sản phẩm";
    content =
      "Đặc tính sản phẩm càng đầy đủ càng tăng khả năng chọn mua của khách hàng tiềm năng. Hãy cung cấp cả đặc tính chính (key attributes) và đặc tính phụ để tăng hiển thị và chốt đơn";
  } else if (state === 3) {
    title = "Mô tả sản phẩm";
    content =
      "Vui lòng tải lên hình ảnh, điền tên sản phẩm và chọn đúng ngành hàng trước khi đăng tải sản phẩm.";
  } else if (state === 4) {
    title = "Giá bán, Kho hàng và Biến thể";
    content =
      "Vui lòng tải lên hình ảnh, điền tên sản phẩm và chọn đúng ngành hàng trước khi đăng tải sản phẩm.";
  }
  return (
    <div className={reusableStyle.inputBlock}>
      <h2
        className="text-blue-500"
        style={{ lineHeight: "25px", marginBottom: "-4px" }}
      >
        {title}
      </h2>
      <span
        style={{
          lineHeight: "20px",
          fontWeight: 300,
          fontSize: "14px",
          textAlign: "justify",
          paddingLeft: "8px",
        }}
      >
        {content}
      </span>
    </div>
  );
};
const ErrorBlock = ({ hasError }) => {
  return (
    <div className={reusableStyle.inputBlock}>
      {!hasError ? (
        <h2 style={{ color: "green", lineHeight: "25px" }}>
          Hay quá, bạn đã sửa hết lỗi rồi!
        </h2>
      ) : (
        <h2 style={{ color: "red", lineHeight: "25px" }}>
          OOps, hãy sửa lỗi trước khi publish nhé!
        </h2>
      )}
    </div>
  );
};

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
