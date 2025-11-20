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
import ComboBoxWithSearch from "@/reuseables/ComboboxWithSearch";
import { InputBlock_Input } from "@/reuseables/Input";
import UploadComponent from "@/reuseables/UploadComponent";
import { buildCategoryNameRecursively } from "@/utils";
import { Menu, Trash, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import { v4 } from "uuid";
const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};

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
export default function AddNewProductPage() {
  const [productName, setProductName] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [productProperties, setProductProperties] = useState([
    { name: "", value: "" },
  ]);
  const [productDescription, setProductDescription] = useState("");
  const [variant1, setVariant1] = useState(variant1Default);
  const [variant2, setVariant2] = useState(variant2Default);
  const [variantSellingPoint, setVariantSellingPoint] = useState([]);
  const [formErrors, setFormErrors] = useState({
    basicInfoError: [],
    propertiesError: [],
    descriptionError: [],
    variant1Error: [],
    variant2Error: [],
    variantTableError: [],
  });

  const addNewProperty = () => {
    setProductProperties((prev) => [...prev, { name: "", value: "" }]);
  };
  //basic info block
  const getAllCategory = async () => {
    try {
      const response = await categoryApi.getAllCategory();
      setAllCategories(response.data);
    } catch (error) {
      toast.error("Có lỗi khi lấy dữ liệu ngành hàng");
    }
  };
  useEffect(() => {
    getAllCategory();
  }, []);
  const allSelectableCategories = useMemo(() => {
    const newList = [...allCategories];
    const allParentId = newList.map((category) => category.parentId);
    const leaf = newList.filter(
      (category) => !allParentId.includes(category.categoryId)
    );
    return leaf;
  }, [allCategories]);
  //variant table
  useEffect(() => {
    if (!variant1 && !variant2) {
      const specialCase = [
        {
          sellerSku: "special-case",
          sellingPrice: "",
          stock: "",
          isInUse: true,
          isOpenToSale: true,
        },
      ];
      setVariantSellingPoint(specialCase);
      return;
    }
    const oldDataRow = variantSellingPoint;
    const newDataRow = [];
    const v1Exist = variant1 && variant1.valueList.length > 1;
    const v2Exist = variant2 && variant2.valueList.length > 1;
    //generating new data
    if (v1Exist) {
      //loop through and create daata
      //preprocess variant value list
      let variant1ValueList = variant1.valueList;
      variant1ValueList = variant1ValueList.slice(
        0,
        variant1ValueList.length - 1
      );
      if (!v2Exist) {
        for (let i = 0; i < variant1ValueList.length; i++) {
          newDataRow.push({
            sellerSku: "",
            sellingPrice: "",
            stock: "",
            isInUse: true,
            isOpenToSale: true,
            v1_name: variant1ValueList[i].name,
            v1_tempId: variant1ValueList[i].tempId,
          });
        }
      } else {
        let variant2ValueList = variant2.valueList;
        variant2ValueList = variant2ValueList.slice(
          0,
          variant2ValueList.length - 1
        );
        for (let i = 0; i < variant1ValueList.length; i++) {
          for (let j = 0; j < variant2ValueList.length; j++) {
            newDataRow.push({
              sellerSku: "",
              sellingPrice: "",
              stock: "",
              isInUse: true,
              isOpenToSale: true,
              v1_name: variant1ValueList[i].name,
              v1_tempId: variant1ValueList[i].tempId,
              v2_name: variant2ValueList[j].name,
              v2_tempId: variant2ValueList[j].tempId,
            });
          }
        }
      }
    }
    //helping filling
    for (let i = 0; i < oldDataRow.length; i++) {
      const _v1Exist = v1Exist && oldDataRow[i].v1_tempId;
      const _v2Exist = v2Exist && oldDataRow[i].v2_tempId;
      if (!_v1Exist && !_v2Exist) {
        break;
      }
      if (_v1Exist) {
        if (_v2Exist) {
          const match = newDataRow.find(
            (element) =>
              element.v1_tempId === oldDataRow[i].v1_tempId &&
              element.v2_tempId === oldDataRow[i].v2_tempId
          );
          if (match) {
            match.isOpenToSale = oldDataRow[i].isOpenToSale;
            match.isInUse = oldDataRow[i].isInUse;
            match.sellerSku = oldDataRow[i].sellerSku;
            match.stock = oldDataRow[i].stock;
            match.sellingPrice = oldDataRow[i].sellingPrice;
          }
        } else {
          // console.log("C: ");
          const match = newDataRow.find((element) => {
            if (!element.v1_tempId) return false;
            return element.v1_tempId === oldDataRow[i].v1_tempId;
          });
          // console.log("Match: ", match);
          if (match) {
            match.isOpenToSale = oldDataRow[i].isOpenToSale;
            match.isInUse = oldDataRow[i].isInUse;
            match.sellerSku = oldDataRow[i].sellerSku;
            match.stock = oldDataRow[i].stock;
            match.sellingPrice = oldDataRow[i].sellingPrice;
          }
        }
      }
    }
    // console.log("A3");
    // console.log("O:", oldDataRow);
    // console.log("N: ", newDataRow);
    setVariantSellingPoint(newDataRow);
  }, [variant1, variant2]);

  //tracker
  const basicInfoRef = useRef(null);
  const propertiesRef = useRef(null);
  const descriptionRef = useRef(null);
  const variantsRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const sections = [
      basicInfoRef.current,
      propertiesRef.current,
      descriptionRef.current,
      variantsRef.current,
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target);
            if (index !== -1) setCurrentStep(index + 1);
          }
        });
      },
      {
        threshold: 0.3, // 30% visible triggers activation
        rootMargin: "-10% 0px -40% 0px", // feels natural like Shopee/Lazada
      }
    );

    sections.forEach((sec) => sec && observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  //tip
  const [tipState, setTipState] = useState(0);

  //error
  const basicFirstRun = useRef(true);
  const descriptionFirstRun = useRef(true);
  const propertiesFirstRun = useRef(true);
  const variant1FirstRun = useRef(true);
  const variant2FirstRun = useRef(true);
  const variantTableFirstRun = useRef(true);
  //basic info
  useEffect(() => {
    if (basicFirstRun.current) {
      // console.log("A");
      basicFirstRun.current = false;
      return;
    }
    // console.log("B");
    const newErrorList = [];
    if (productName === "" || selectedCategory === "") {
      newErrorList.push("Vui lòng nhập đầy đủ các trường");
    }
    if (productName.length < 10) {
      newErrorList.push("Tên sản phẩm phải tối thiểu 10 ký tự!");
    }
    if (!thumbnailFile) {
      newErrorList.push("Vui lòng tải ảnh bìa sản phẩm lên!");
    }
    setFormErrors((prev) => ({ ...prev, basicInfoError: newErrorList }));
  }, [productName, selectedCategory, thumbnailFile]);
  //properties
  useEffect(() => {
    if (propertiesFirstRun.current) {
      // console.log("A");
      propertiesFirstRun.current = false;
      return;
    }
    //at least 3 properties & no blank, no same name
    const newErrorList = [];
    if (productProperties.length < 3) {
      newErrorList.push("Phải có ít nhất 3 thuộc tính sản phẩm");
    }
    productProperties.some((element) => {
      if (element.name.trim() === "" || element.value.trim() === "") {
        newErrorList.push("Không được để trống dòng thuộc tính");
        return true; // stops iteration early
      }
    });
    const names = productProperties.map((property) => property.name);
    const sNames = new Set(names);
    if (names.length !== sNames.size) {
      console.log("S: ", sNames);
      console.log("N: ", names);
      newErrorList.push("Các thuộc tính không được trùng tên với nhau");
    }
    setFormErrors((prev) => ({ ...prev, propertiesError: newErrorList }));
  }, [productProperties]);
  useEffect(() => {
    if (!variant1) return;
    if (variant1FirstRun.current) {
      variant1FirstRun.current = false;
      return;
    }
    const newErrorList = [];
    if (variant1.name.trim() === "") {
      newErrorList.push("Không được để trống tên biến thể!");
    }
    const valueList = variant1.valueList;
    if (valueList.length === 1) {
      newErrorList.push("Phải có ít nhất một giá trị cho biến thể!");
    }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].name.trim() === "") {
        newErrorList.push("Không được để trống giá trị của biến thể");
        break;
      }
    }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].img.length < 1) {
        newErrorList.push("Phải cung cấp ảnh cho mọi biến thể!");
        break;
      }
    }
    const names = valueList.map((value) => value.name);
    if (names.length !== new Set(names).size) {
      newErrorList.push("Các biến thể không được trùng tên nhau!");
    }
    setFormErrors((prev) => ({ ...prev, variant1Error: newErrorList }));
  }, [variant1]);
  useEffect(() => {
    // console.log("2: ", variant2);
    if (!variant2) return;
    if (variant2FirstRun.current) {
      variant2FirstRun.current = false;
      return;
    }
    // console.log("2a: ", variant2);
    const newErrorList = [];
    if (variant2.name.trim() === "") {
      newErrorList.push("Không được để trống tên biến thể!");
    }
    const valueList = variant2.valueList;
    if (valueList.length === 1) {
      newErrorList.push("Phải có ít nhất một giá trị cho biến thể!");
    }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].name.trim() === "") {
        newErrorList.push("Không được để trống giá trị của biến thể");
        break;
      }
    }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].img.length) {
        newErrorList.push("Phải cung cấp ảnh cho mọi biến thể!");
        break;
      }
    }
    const names = valueList.map((value) => value.name);
    if (names.length !== new Set(names).size) {
      newErrorList.push("Các biến thể không được trùng tên nhau!");
    }
    setFormErrors((prev) => ({ ...prev, variant2Error: newErrorList }));
  }, [variant2]);
  useEffect(() => {
    if (descriptionFirstRun.current) {
      descriptionFirstRun.current = false;
      return;
    }
    const newErrorList = [];
    if (productDescription.length < 20) {
      newErrorList.push("Mô tả sản phẩm quá ngắn!");
    }
    //console.log(newErrorList);
    setFormErrors((prev) => ({ ...prev, descriptionError: newErrorList }));
  }, [productDescription]);
  useEffect(() => {
    if (variantTableFirstRun.current) {
      variantTableFirstRun.current = false;
      return;
    }
    const newErrorList = [];
    for (const dataRow of variantSellingPoint) {
      if (
        dataRow.sellingPrice.trim() === "" ||
        dataRow.sellerSku.trim() === "" ||
        dataRow.stock.trim() === ""
      ) {
        newErrorList.push("Không được bỏ trống bất kỳ dòng nào!");
        break;
      }
    }
    setFormErrors((prev) => ({ ...prev, variantTableError: newErrorList }));
  }, [variantSellingPoint]);
  const hasError = useMemo(() => {
    // console.log(formErrors);
    if (
      formErrors.basicInfoError.length > 0 ||
      formErrors.descriptionError.length > 0 ||
      formErrors.propertiesError.length > 0 ||
      formErrors.variant1Error.length > 0
    ) {
      return true;
    }
    return false;
  }, [formErrors]);

  const handlePublishSubmit = async () => {
    const formData = formFinalFormData();
    try {
      const response = await productApi.createNewProduct(formData);
    } catch (error) {
      toast.error("Có lỗi khi thêm mới sản phẩm");
    }
  };
  const handleDraftSubmit = async () => {
    const formData = formFinalFormData();
    formData.append("isDraft", "1");
    try {
      const response = await productApi.createNewProduct(formData);
    } catch (error) {
      toast.error("Có lỗi khi thêm mới sản phẩm");
    }
  };
  const formFinalFormData = async () => {
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("categoryId", selectedCategory);
    formData.append("thumbnailFile", thumbnailFile);

    const propertyList = JSON.stringify(productProperties);
    formData.append("propertyList", propertyList);

    formData.append("description", productDescription);

    //variants & img
    //variantData
    let total = 0;
    const v1Exist = variant1 && variant1.valueList.length > 1;
    const v2Exist = variant2 && variant2.valueList.length > 1;
    if (v1Exist) total++;
    if (v2Exist) total++;
    formData.append("totalVariant", total);

    if (v1Exist) {
      let _v1 = { ...variant1 };
      //filter out img data
      _v1.valueList = _v1.valueList.filter((value) => value.name !== "");
      _v1.valueList = _v1.valueList.map((value) => ({
        value: value.name,
        tempId: value.tempId,
      }));
      formData.append("variant1Data", JSON.stringify(_v1));

      //process variant 1 image - file name - v1_tempId
      const v1ImgList = variant1.valueList.map((value) => ({
        img: value.img,
        tempId: value.tempId,
      }));
      //each value( Đen, đỏ) level
      v1ImgList.forEach((imgValue) => {
        //because each img is encapsulated!
        const imgArray = imgValue.img.map((img) => img.file);
        console.log("V1 img:", imgArray);
        //has to do it separately
        imgArray.forEach((img) => {
          formData.append("v1_" + imgValue.tempId, img);
        });
      });
    }
    if (v2Exist) {
      let _v2 = { ...variant2 };
      //filter out img data
      _v2.valueList = _v2.valueList.map((value) => ({
        value: value.value,
        tempId: value.tempId,
      }));
      formData.append("variant2Data", JSON.stringify(_v2));
    }
    // console.log("V1: ", variant1);
    formData.append("variantTableData", JSON.stringify(variantSellingPoint));
    formData.forEach((v, k) => {
      console.log(k, v);
    });
    return formData;
  };
  return (
    <div className="page-layout">
      <h1>Thêm sản phẩm mới</h1>
      {/* Big layout!*/}
      {/*Content*/}
      <form className="grid grid-cols-[75%_25%] gap-4">
        <div className="flex flex-col gap-6">
          <div ref={basicInfoRef} onClick={() => setTipState(1)}>
            <div
              className={
                reusableStyle.inputBlock +
                (formErrors.basicInfoError.length > 0 &&
                  reusableStyle.errorBorder)
              }
            >
              <h2>Thông tin cơ bản</h2>
              <div className="flex flex-row gap-10">
                <div className="w-[70%] flex flex-col gap-5">
                  <InputBlock_Input
                    label="Tên sản phẩm"
                    description="Tiêu đề nhiều ngôn ngữ sẽ được hiển thị khi người mua thay đổi cài đặt ngôn ngữ mặc định của ứng dụng của họ. Thiết lập nó có thể giúp cải thiện việc thu hồi sản phẩm trong các ứng dụng nhắm mục tiêu vào các ngôn ngữ khác nhau."
                    isRequired={true}
                    placeholder="Nhập tên sản phẩm"
                    value={productName}
                    onInputValueChange={(e) => setProductName(e.target.value)}
                  />
                  <div className="grid gap-2">
                    <Label className="gap-1 text-[14px]">
                      <span className="text-destructive">*</span>Chọn ngành hàng
                    </Label>
                    <ComboBoxWithSearch
                      textPlaceholder="Chọn ngành hàng cho sản phẩm"
                      optionPlaceHolder="Tìm kiếm ngành hàng"
                      comboboxValue={selectedCategory}
                      comboboxValueList={allSelectableCategories.map(
                        (category) => ({
                          id: category.categoryId,
                          display: buildCategoryNameRecursively(
                            category,
                            allCategories
                          ),
                        })
                      )}
                      onValueChange={(value) => setSelectedCategory(value)}
                    />
                  </div>

                  {formErrors.basicInfoError.length > 0 && (
                    <ul
                      style={{ marginTop: "0px", marginBottom: "-4px" }}
                      className="ul-error"
                    >
                      {formErrors.basicInfoError.map((element, idx) => (
                        <li key={idx}>{element}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="w-[30%] flex flex-col gap-2.5">
                  <h2>Ảnh bìa sản phẩm</h2>
                  <UploadComponent
                    className="h-full"
                    onImageChange={(file) => setThumbnailFile(file)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div ref={propertiesRef} onClick={() => setTipState(2)}>
            <PropertiesBlock
              properties={productProperties}
              setProperties={setProductProperties}
              onAddNewProperty={addNewProperty}
              errors={formErrors.propertiesError}
            />
          </div>
          <div ref={descriptionRef} onClick={() => setTipState(3)}>
            <DescriptionBlock
              errors={formErrors.descriptionError}
              description={productDescription}
              setDescription={setProductDescription}
            />
          </div>
          <div ref={variantsRef} onClick={() => setTipState(4)}>
            <VariantAndSellingBlock
              variant1={variant1}
              variant2={variant2}
              setVariant1={setVariant1}
              setVariant2={setVariant2}
              variantSellingPoint={variantSellingPoint}
              setVariantSellingPoint={setVariantSellingPoint}
              v1Errors={formErrors.variant1Error}
              v2Errors={formErrors.variant2Error}
              vTableErrors={formErrors.variantTableError}
            />
          </div>
          <div
            className={`${reusableStyle.inputBlock} flex flex-row gap-2! justify-end sticky bottom-0 bg-gray-50 shadow-3xl! -ml-1`}
          >
            <Button variant={"ghost"}>Hủy bỏ</Button>
            <Button
              variant={"outline"}
              className={"border-blue-500"}
              onClick={handleDraftSubmit}
            >
              Lưu bản nháp
            </Button>
            <Button className={"bg-blue-500"} onClick={handlePublishSubmit}>
              Gửi đi
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6 sticky top-5 h-fit">
          <ProgressTracker currentStep={currentStep} />
          <TipBlock state={tipState} />
          <ErrorBlock hasError={hasError} />
        </div>
      </form>
    </div>
  );
}
function DescriptionBlock({ description, setDescription, errors }) {
  return (
    <div
      id="editor"
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
    const newVariantSellingPoint = variantSellingPoint.map((variant) => ({
      ...variant,
      sellingPrice: allPrice,
      stock: allStock,
      sellerSku: allSellerSku,
    }));
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
      {total < 2 && (
        <Button
          variant={"outline"}
          className="w-fit"
          onClick={createNewVariant}
        >
          + Thêm biến thể mới{` (${total}/2)`}
        </Button>
      )}
      <h2>Giá bán & Kho hàng </h2>
      {variantSellingPoint.length > 0 ? (
        <div className="space-y-2">
          {total > 0 ? (
            <section className="flex gap-2 *:>m-w-[100px]">
              <Input
                placeholder="Giá"
                value={allPrice}
                onChange={(e) => setAllPrice(e.target.value)}
              />
              <Input
                placeholder="Kho hàng"
                value={allStock}
                onChange={(e) => setAllStock(e.target.value)}
              />
              <Input
                placeholder="SellerSku"
                value={allSellerSku}
                onChange={(e) => setAllSellerSku(e.target.value)}
              />
              <Button onClick={handleSubmitApplyAllToolbar}>
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
      <div className="flex flex-col gap-4 max-w-[70%]">
        <Label>Danh sách biến thể</Label>
        {variant.valueList.map((variantValue, index) => (
          <div
            key={index}
            className="flex gap-4 p-2 pl-4  bg-white shadow-sm rounded-lg items-center justify-between"
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
