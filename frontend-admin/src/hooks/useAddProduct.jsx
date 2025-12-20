import { useEffect, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";

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

export default function useAddProduct() {
  //data
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
  const [variantDetail, setVariantDetail] = useState([]);

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
          sellerSku: slugify(productName, slugifyOption) || "special-case",
          sellingPrice: "",
          stock: "",
          isInUse: true,
          isOpenToSale: true,
        },
      ];
      setVariantDetail(specialCase);
      return;
    }
    const oldDataRow = variantDetail;
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
          let sellSku = "";
          if (productName) {
            sellSku = slugify(productName, slugifyOption);
          }
          newDataRow.push({
            sellerSku: sellSku,
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
            let sellSku = "";
            if (productName) {
              sellSku = slugify(productName);
            }
            newDataRow.push({
              sellerSku: sellSku,
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
    setVariantDetail(newDataRow);
  }, [variant1, variant2]);

  //tracker - ui state
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
    // if (productProperties.length < 1) {
    //   newErrorList.push("Phải có ít nhất 1 thuộc tính sản phẩm");
    // }
    // productProperties.some((element) => {
    //   if (element.name.trim() === "" || element.value.trim() === "") {
    //     newErrorList.push("Không được để trống dòng thuộc tính");
    //     return true; // stops iteration early
    //   }
    // });
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
    for (const dataRow of variantDetail) {
      if (
        dataRow.sellingPrice.trim() === "" ||
        dataRow.sellerSku.trim() === "" ||
        dataRow.stock.trim() === ""
      ) {
        newErrorList.push("Không được bỏ trống bất kỳ dòng nào!");
        break;
      }
    }
    const sellerSkuSet = new Set();
    for (const dataRow of variantDetail) {
      if (sellerSkuSet.has(dataRow.sellerSku)) {
        newErrorList.push("Không được trùng tên seller sku");
        break;
      }
      sellerSkuSet.add(dataRow.sellerSku);
    }
    setFormErrors((prev) => ({ ...prev, variantTableError: newErrorList }));
  }, [variantDetail]);
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

  //submit
  const handlePublishSubmit = async () => {
    const formData = await formFinalFormData();
    try {
      const response = await productApi.createNewProduct(formData);
    } catch (error) {
      toast.error("Có lỗi khi thêm mới sản phẩm");
    }
  };
  const handleDraftSubmit = async () => {
    const formData = await formFinalFormData();
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

    let propertyList = productProperties.filter(
      (property) => property.name !== ""
    );
    propertyList = JSON.stringify(productProperties);
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
      _v2.valueList = _v2.valueList.filter((value) => value.name !== "");
      _v2.valueList = _v2.valueList.map((value) => ({
        value: value.name,
        tempId: value.tempId,
      }));
      formData.append("variant2Data", JSON.stringify(_v2));
    }
    // console.log("V1: ", variant1);
    formData.append("variantTableData", JSON.stringify(variantDetail));
    formData.forEach((v, k) => {
      console.log(k, v);
    });
    return formData;
  };

  return {
    // ---------- Basic product data ----------
    productName,
    setProductName,
    allCategories,
    allSelectableCategories,
    selectedCategory,
    setSelectedCategory,
    thumbnailFile,
    setThumbnailFile,
    productDescription,
    setProductDescription,

    // ---------- Properties ----------
    productProperties,
    setProductProperties,
    addNewProperty,

    // ---------- Variants ----------
    variant1,
    setVariant1,
    variant2,
    setVariant2,
    variantDetail,
    setVariantDetail,

    // ---------- Validation ----------
    formErrors,
    hasError,

    // ---------- UI refs (scroll / tracking) ----------
    basicInfoRef,
    propertiesRef,
    descriptionRef,
    variantsRef,

    // ---------- Step / tips ----------
    currentStep,
    tipState,
    setTipState,

    // ---------- Submit actions ----------
    handlePublishSubmit,
    handleDraftSubmit,
  };
}
