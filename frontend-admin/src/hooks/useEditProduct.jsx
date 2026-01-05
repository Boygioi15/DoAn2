import categoryApi from "@/api/categoryApi";
import { productApi } from "@/api/productApi";
import { slugifyOption } from "@/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import slugify from "slugify";
import { toast } from "sonner";
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

export default function useEditProduct() {
  //data
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useSearchParams();
  const edit = useMemo(() => {
    if (!searchParam.get("edit")) {
      return false;
    }
    if (searchParam.get("edit") === "true") {
      return true;
    }
  }, [searchParam]);
  const param = useParams();
  // console.log("P: ", param);
  // console.log("SP: ", searchParam);

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [productName, setProductName] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [propertyList, setProductPropertyList] = useState([
    { name: "", value: "" },
  ]);
  const [productDescription, setProductDescription] = useState("");
  const [variant1, setVariant1] = useState(variant1Default);
  const [variant2, setVariant2] = useState(variant2Default);
  const [variantDetailList, setVariantDetailList] = useState([]);

  const [sizeGuidance, setSizeGuidance] = useState([]);
  const [formErrors, setFormErrors] = useState({
    basicInfoError: [],
    propertyListError: [],
    descriptionError: [],
    variant1Error: [],
    variant2Error: [],
    sizeListError: [],
    variantDetailListError: [],
  });

  const addNewProperty = () => {
    setProductPropertyList((prev) => [...prev, { name: "", value: "" }]);
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

  //variant detail
  const [allPrice, setAllPrice] = useState("");
  const [allStock, setAllStock] = useState("");
  const [allSellerSku, setAllSellerSku] = useState("");

  const handleSubmitApplyAllToolbar = () => {
    const newVariantDetailList = variantDetailList.map((variant, index) => {
      const newVariant = { ...variant };
      if (allPrice.trim() !== "") {
        newVariant.price = allPrice;
      }
      if (allStock.trim() !== "") {
        newVariant.stock = allStock;
      }
      if (allSellerSku.trim() !== "") {
        newVariant.seller_sku = allSellerSku + `-${index + 1}`;
      }
      return newVariant;
    });
    setVariantDetailList(newVariantDetailList);
  };
  const handleRefreshApplyAllToolbar = () => {
    setAllPrice("");
    setAllStock("");
    setAllSellerSku("");
  };
  const generateVariantDetailFromVariant = (variant1, variant2) => {
    if (!variant1 && !variant2) {
      const specialCase = [
        {
          seller_sku: slugify(productName, slugifyOption) || "special-case",
          price: "",
          stock: "",
          isInUse: true,
          isOpenToSale: true,
        },
      ];
      setVariantDetailList(specialCase);
      return;
    }
    const oldDataRow = variantDetailList;
    const newDataRow = [];
    const v1Exist = variant1 && variant1.valueList.length > 1;
    const v2Exist = variant2 && variant2.valueList.length > 1;
    //generating new data
    // console.log("V1: ", variant1);
    if (v1Exist) {
      //loop through and create daata
      //preprocess variant value list
      let variant1ValueList = variant1.valueList;
      variant1ValueList = variant1ValueList.filter(
        (value) => value.name.trim().length > 0
      );
      if (!v2Exist) {
        for (let i = 0; i < variant1ValueList.length; i++) {
          let sellSku = "";
          if (productName) {
            sellSku = slugify(productName, slugifyOption);
          }
          newDataRow.push({
            seller_sku: sellSku,
            price: "",
            stock: "",
            isInUse: true,
            isOpenToSale: true,
            v1_name: variant1ValueList[i].name,
            v1_tempId: variant1ValueList[i].tempId,
          });
        }
      } else {
        let variant2ValueList = variant2.valueList;
        variant2ValueList = variant2ValueList.filter(
          (value) => value.name.trim().length > 0
        );
        for (let i = 0; i < variant1ValueList.length; i++) {
          for (let j = 0; j < variant2ValueList.length; j++) {
            let sellSku = "";
            if (productName) {
              sellSku = slugify(productName);
            }
            newDataRow.push({
              seller_sku: sellSku,
              price: "",
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
            match.seller_sku = oldDataRow[i].seller_sku;
            match.stock = oldDataRow[i].stock;
            match.price = oldDataRow[i].price;
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
            match.seller_sku = oldDataRow[i].seller_sku;
            match.stock = oldDataRow[i].stock;
            match.price = oldDataRow[i].price;
          }
        }
      }
    }
    // console.log("A3");
    // console.log("O:", oldDataRow);
    // console.log("N: ", newDataRow);
    setVariantDetailList(newDataRow);
  };

  //size list
  const [useSize1, setUseSize1] = useState(true);
  const [useSize2, setUseSize2] = useState(true);
  const [useSize3, setUseSize3] = useState(true);
  const [useSize4, setUseSize4] = useState(true);
  const [useSize5, setUseSize5] = useState(true);

  const generateNewSizeGuidanceDataFromVariant = (
    newVariant2,
    initialSizeList = null
  ) => {
    let oldSizeList = [];
    if (initialSizeList) {
      oldSizeList = [...initialSizeList];
    } else {
      oldSizeList = [...sizeGuidance];
    }
    console.log("OSL: ", oldSizeList);
    const newSizeList = [];
    newVariant2.valueList.forEach((value) => {
      if (value.name.trim().length > 0)
        newSizeList.push({
          name: value.name,
          fit: {
            height: { min: "", max: "" },
            weight: { min: "", max: "" },
            bust: { min: "", max: "" },
            waist: { min: "", max: "" },
            hip: { min: "", max: "" },
          },
        });
    });
    //help filler;
    oldSizeList.forEach((oldSize) => {
      for (let i = 0; i < newSizeList.length; i++) {
        if (oldSize.name === newSizeList[i].name) {
          if (oldSize.fit.height)
            newSizeList[i].fit.height = oldSize.fit.height;
          if (oldSize.fit.weight)
            newSizeList[i].fit.weight = oldSize.fit.weight;
          if (oldSize.fit.bust) newSizeList[i].fit.bust = oldSize.fit.bust;
          if (oldSize.fit.waist) newSizeList[i].fit.waist = oldSize.fit.waist;
          if (oldSize.fit.hip) newSizeList[i].fit.hip = oldSize.fit.hip;
          break;
        }
      }
    });
    console.log("NSL: ", newSizeList);
    setSizeGuidance(newSizeList);
  };

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
      if (!edit) newErrorList.push("Vui lòng tải ảnh bìa sản phẩm lên!");
    }
    setFormErrors((prev) => ({ ...prev, basicInfoError: newErrorList }));
  }, [productName, selectedCategory, thumbnailFile]);
  useEffect(() => {
    if (descriptionFirstRun.current) {
      descriptionFirstRun.current = false;
      return;
    }

    const newErrorList = [];
    // if (productDescription.length < 20) {
    //   console.log("PD: ", productDescription);
    //   newErrorList.push("Mô tả sản phẩm quá ngắn!");
    // }
    //console.log(newErrorList);
    setFormErrors((prev) => ({ ...prev, descriptionError: newErrorList }));
  }, [productDescription]);
  //properties
  useEffect(() => {
    if (propertiesFirstRun.current) {
      propertiesFirstRun.current = false;
      return;
    }

    //at least 3 properties & no blank, no same name
    const newErrorList = [];
    // if (propertyList.length < 1) {
    //   newErrorList.push("Phải có ít nhất 1 thuộc tính sản phẩm");
    // }
    propertyList.some((element) => {
      if (element.name.trim() === "" || element.value.trim() === "") {
        newErrorList.push("Không được để trống dòng thuộc tính");
        return true; // stops iteration early
      }
    });
    const names = propertyList.map((property) => property.name);
    const sNames = new Set(names);
    if (names.length !== sNames.size) {
      console.log("S: ", sNames);
      console.log("N: ", names);
      newErrorList.push("Các thuộc tính không được trùng tên với nhau");
    }
    setFormErrors((prev) => ({ ...prev, propertyListError: newErrorList }));
  }, [propertyList]);

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
    // if (valueList.length === 1) {
    //   newErrorList.push("Phải có ít nhất một giá trị cho biến thể!");
    // }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].name.trim() === "") {
        newErrorList.push("Không được để trống giá trị của biến thể");
        break;
      }
    }
    for (let i = 0; i < valueList.length - 1; i++) {
      if (valueList[i].img.length < 1) {
        if (!edit) newErrorList.push("Phải cung cấp ảnh cho mọi biến thể!");
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
    const names = valueList.map((value) => value.name);
    if (names.length !== new Set(names).size) {
      newErrorList.push("Các biến thể không được trùng tên nhau!");
    }
    setFormErrors((prev) => ({ ...prev, variant2Error: newErrorList }));
  }, [variant2]);

  useEffect(() => {
    if (variantTableFirstRun.current) {
      variantTableFirstRun.current = false;
      return;
    }
    const newErrorList = [];
    for (const dataRow of variantDetailList) {
      if (
        dataRow.price.trim() === "" ||
        dataRow.seller_sku.trim() === "" ||
        dataRow.stock.trim() === ""
      ) {
        newErrorList.push("Không được bỏ trống bất kỳ dòng nào!");
        break;
      }
    }
    const sellerSkuSet = new Set();
    for (const dataRow of variantDetailList) {
      if (sellerSkuSet.has(dataRow.seller_sku)) {
        newErrorList.push("Không được trùng tên seller sku");
        break;
      }
      sellerSkuSet.add(dataRow.seller_sku);
    }
    setFormErrors((prev) => ({
      ...prev,
      variantDetailListError: newErrorList,
    }));
  }, [variantDetailList]);
  const hasError = useMemo(() => {
    // console.log(formErrors);
    if (
      formErrors.basicInfoError.length > 0 ||
      formErrors.descriptionError.length > 0 ||
      formErrors.propertyListError.length > 0 ||
      formErrors.variant1Error.length > 0
    ) {
      return true;
    }
    return false;
  }, [formErrors]);

  const handleLoadSampleData = async () => {
    setProductName("Áo polo dài tay nam test");
    setProductDescription("<p>Thử sản phẩm</p>");
    setSelectedCategory("c98e2fe4-7ba5-4881-a313-421134145b63");
    setProductPropertyList([
      { name: "Chống nắng", value: "Có" },
      { name: "Chống mưa", value: "Có" },
      { name: "Chất liệu", value: "30% trắng 70% xanh" },
    ]);
    const v1Sample = {
      index: 0,
      name: "Màu sắc",
      valueList: [
        {
          name: "Xanh",
          img: [],
          tempId: v4(),
        },
        {
          name: "Đỏ",
          img: [],
          tempId: v4(),
        },
        {
          name: "",
          img: [],
          tempId: v4(),
        },
      ],
    };
    const v2Sample = {
      index: 1,
      name: "Kích cỡ",
      valueList: [
        {
          name: "S",
          tempId: v4(),
        },
        {
          name: "M",
          tempId: v4(),
        },
        {
          name: "L",
          tempId: v4(),
        },
        {
          name: "",
          tempId: v4(),
        },
      ],
    };

    setVariant1(v1Sample);
    setVariant2(v2Sample);
    generateVariantDetailFromVariant(v1Sample, v2Sample);
    setSizeGuidance([
      {
        name: "S",
        fit: {
          height: { min: 150, max: 158 },
          weight: { min: 42, max: 48 },
          bust: { min: 78, max: 84 },
          waist: { min: 58, max: 64 },
          hip: { min: 82, max: 88 },
        },
      },
      {
        name: "M",
        fit: {
          height: { min: 158, max: 165 },
          weight: { min: 48, max: 55 },
          bust: { min: 84, max: 90 },
          waist: { min: 64, max: 70 },
          hip: { min: 88, max: 94 },
        },
      },
      {
        name: "L",
        fit: {
          height: { min: 165, max: 172 },
          weight: { min: 55, max: 62 },
          bust: { min: 90, max: 96 },
          waist: { min: 70, max: 76 },
          hip: { min: 94, max: 100 },
        },
      },
    ]);
    setAllPrice("499000");
    setAllStock("20");
    setAllSellerSku("ao-polo-nam-test");
  };

  //edit section
  const [initialProductData, setInitialProductData] = useState(null);
  const getProductDetail = async (productId) => {
    try {
      const result = await productApi.getProductDetail_EditProduct(productId);
      setInitialProductData(result.data);
      return result.data;
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi tải dữ liệu sản phẩm");
    }
  };
  const loadInitialData = async (productDetail) => {
    setProductName(productDetail.name || "");
    setSelectedCategory(productDetail.categoryId);
    if (productDetail.productDescription) {
    }
    setProductDescription(productDetail.description || "");
    setProductPropertyList(productDetail.propertyList || []);
    let v1 = productDetail.variant1;

    //load image
    v1.valueList = v1.valueList.map((value) => ({
      ...value,
      initialImage: value.img,
      tempId: value.optionId,
    }));
    console.log("V1: ", v1);
    if (productDetail.isDrafted) {
      v1.valueList.push({ name: "", tempId: v4(), img: [] });
    }
    let v2 = productDetail.variant2;
    v2.valueList = v2.valueList.map((value) => ({
      ...value,
      tempId: value.optionId,
    }));
    if (productDetail.isDrafted) {
      v2.valueList.push({ name: "", tempId: v4() });
    }
    setVariant1(v1);
    setVariant2(v2);
    let initialSizeGuidance = productDetail.sizeGuidance;
    initialSizeGuidance = initialSizeGuidance.map((size) => {
      const input = size.name;
      const match = input.match(/^([A-Z]+)/);
      const name = match ? match[1] : null;
      return {
        ...size,
        name,
      };
    });
    if (initialSizeGuidance.length > 0) {
      setUseSize1(!!initialSizeGuidance[0].fit.height);
      setUseSize2(!!initialSizeGuidance[0].fit.weight);
      setUseSize3(!!initialSizeGuidance[0].fit.bust);
      setUseSize4(!!initialSizeGuidance[0].fit.waist);
      setUseSize5(!!initialSizeGuidance[0].fit.hip);
    }
    generateNewSizeGuidanceDataFromVariant(v2, initialSizeGuidance);
    const _temp = productDetail.variantDetailList.map((detail) => {
      // console.log("DS: ", detail.stock);
      let stock;
      if (detail.stock === 0) {
        stock = "0";
      } else if (!detail.stock) {
        stock = "";
      } else {
        stock = detail.stock.toString();
      }
      return {
        ...detail,
        v1_name: detail.optionValue1,
        v2_name: detail.optionValue2,
        v1_tempId: detail.optionId1,
        v2_tempId: detail.optionId2,
        stock,
        price:
          detail.price ?? detail.price === 0 ? detail.price.toString() : "",
      };
    });
    // console.log(_temp);
    setVariantDetailList(_temp);
    // setSizeGuidance(productDetail.sizeGuidance);
  };
  // useEffect(() => {
  //   console.log("VDL: ", variantDetailList);
  // }, [variantDetailList]);
  const onEditBootup = async () => {
    console.log(edit);
    if (edit) {
      const productId = param.productId;
      const detail = await getProductDetail(productId);
      loadInitialData(detail);
    }
  };
  useEffect(() => {
    onEditBootup();
  }, [edit]);

  //submit
  const handlePublishNewProduct = async () => {
    const formData = await formFinalFormData();
    try {
      setIsSubmitLoading(true);
      const response = await productApi.publishNewProduct(formData);
      navigate("/product-management");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi thêm mới sản phẩm");
    } finally {
      setIsSubmitLoading(false);
    }
  };
  const handleCreateNewDraft = async () => {
    const formData = await formFinalFormData();
    try {
      setIsSubmitLoading(true);

      const response = await productApi.createNewDraft(formData);
      navigate("/product-management");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi thêm mới bản nháp");
    } finally {
      setIsSubmitLoading(false);
    }
  };
  const handleUpdateDraft = async () => {
    try {
      setIsSubmitLoading(true);

      const formData = await formFinalFormData();
      const response = await productApi.updateDraft(
        initialProductData.productId,
        formData
      );
      toast.success("Cập nhật bản nháp thành công");
      navigate("/product-management");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi cập nhật bản nháp");
    } finally {
      setIsSubmitLoading(false);
    }
  };
  const handlePublishDraft = async () => {
    try {
      setIsSubmitLoading(true);

      const formData = await formFinalFormData();
      const response = await productApi.publishDraft(
        initialProductData.productId,
        formData
      );
      toast.success("Xuất bản bản nháp thành công");
      navigate("/product-management");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi xuất bản bản nháp");
    } finally {
      setIsSubmitLoading(false);
    }
  };
  const handleUpdateProduct = async () => {
    try {
      setIsSubmitLoading(true);

      const formData = await formFinalFormData();
      const response = await productApi.updateProduct(
        initialProductData.productId,
        formData
      );
      toast.success("Cập nhật sản phẩm thành công");
      navigate("/product-management");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi Cập nhật sản phẩm");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const formFinalFormData = async () => {
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("categoryId", selectedCategory);
    formData.append("thumbnailFile", thumbnailFile);

    let tosendPropertyList = propertyList.filter(
      (property) => property.name !== ""
    );
    formData.append("propertyList", JSON.stringify(tosendPropertyList));
    formData.append("description", productDescription);

    let toSendSizeList = sizeGuidance.map((size) => {
      const toSendSize = {
        name: size.name,
        fit: {},
      };

      if (useSize1 && size.fit.weight) {
        toSendSize.fit.weight = {
          min: size.fit.weight.min,
          max: size.fit.weight.max,
        };
      }

      if (useSize2 && size.fit.height) {
        toSendSize.fit.height = {
          min: size.fit.height.min,
          max: size.fit.height.max,
        };
      }

      if (useSize3 && size.fit.bust) {
        toSendSize.fit.bust = {
          min: size.fit.bust.min,
          max: size.fit.bust.max,
        };
      }

      if (useSize4 && size.fit.waist) {
        toSendSize.fit.waist = {
          min: size.fit.waist.min,
          max: size.fit.waist.max,
        };
      }

      if (useSize5 && size.fit.hip) {
        toSendSize.fit.hip = {
          min: size.fit.hip.min,
          max: size.fit.hip.max,
        };
      }

      return toSendSize;
    });

    formData.append("sizeGuidance", JSON.stringify(toSendSizeList));

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
    formData.append("variantTableData", JSON.stringify(variantDetailList));
    formData.forEach((v, k) => {
      console.log(k, v);
    });
    return formData;
  };

  return {
    edit,
    initialProductData,

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
    propertyList,
    setProductPropertyList,
    addNewProperty,

    // ---------- Variants ----------
    variant1,
    setVariant1,
    variant2,
    setVariant2,
    variantDetailList,
    setVariantDetailList,
    generateVariantDetailFromVariant,

    //sizes
    sizeGuidance,
    setSizeGuidance,

    useSize1,
    useSize2,
    useSize3,
    useSize4,
    useSize5,
    setUseSize1,
    setUseSize2,
    setUseSize3,
    setUseSize4,
    setUseSize5,
    generateNewSizeGuidanceDataFromVariant,

    allPrice,
    setAllPrice,
    allStock,
    setAllStock,
    allSellerSku,
    setAllSellerSku,
    handleRefreshApplyAllToolbar,
    handleSubmitApplyAllToolbar,

    // ---------- Validation ----------
    formErrors,
    setFormErrors,
    hasError,

    // ---------- Submit actions ----------
    handlePublishNewProduct,
    handleCreateNewDraft,
    handleUpdateDraft,
    handlePublishDraft,
    handleUpdateProduct,
    handleLoadSampleData,

    isSubmitLoading,
  };
}
