import categoryApi from "@/api/categoryApi";
import { productApi } from "@/api/productApi";
import { buildCategoryTree, buildQueryStringFromObject } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function useCategoryManagement() {
  const [searchParam, setSearchParam] = useSearchParams();
  const [categoryList, setCategoryList] = useState(null);

  const selectedCategoryId = useMemo(
    () => searchParam.get("categoryId") || "",
    [searchParam]
  );
  const setSelectedCategoryId = (categoryId) => {
    console.log("CID: ", categoryId);
    const newSearchParam = new URLSearchParams(searchParam);
    newSearchParam.set("categoryId", categoryId);
    setSearchParam(newSearchParam);
  };
  const selectedCategory = useMemo(() => {
    if (!categoryList) return null;
    return (
      categoryList.find(
        (category) => category.categoryId === selectedCategoryId
      ) || null
    );
  }, [selectedCategoryId, categoryList]);
  const [productList, setProductList] = useState(null);
  const [productListMetadata, setProductListMetadata] = useState(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  //pagination:
  const [from, setFrom] = useState(1);
  const size = 12;

  const getAllCategory = async () => {
    try {
      const response = await categoryApi.getAllCategory();
      setCategoryList(response.data);
    } catch (error) {
      toast.error("Có lỗi khi lấy dữ liệu ngành hàng");
    }
  };
  useEffect(() => {
    getAllCategory();
  }, []);

  const getAllProductOfCategory = async (categoryId, from) => {
    try {
      const queryObject = {};
      queryObject.from = from;
      queryObject.size = size;
      queryObject.categoryId = categoryId;
      const response = await productApi.getProductList(
        buildQueryStringFromObject(queryObject)
      );
      setProductList(response.data.productList);
      setProductListMetadata(response.data.metadata);
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi lấy dữ liệu sản phẩm");
    }
  };
  useEffect(() => {
    if (selectedCategoryId !== "") {
      getAllProductOfCategory(selectedCategoryId, 1);
      setFrom(1);
    }
  }, [searchParam]);
  const categoryTree = useMemo(() => {
    const result = buildCategoryTree(categoryList);
    return result;
  }, [categoryList]);

  async function handleCreateCategory(categoryData) {
    if (categoryData.parentId === "!") categoryData.parentId = null;
    const data = {
      categoryName: categoryData.categoryName,
      parentId: categoryData.parentId,
    };
    try {
      console.log("AD: ", data);
      const response = await categoryApi.createNewCategory(data);
      setCategoryList(response.data);
      toast.success("Tạo mới ngành hàng thành công");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error("Có lỗi khi tạo mới ngành hàng");
    }
  }
  async function handleUpdateCategory(categoryId, categoryData) {
    console.log("I:", categoryId);
    console.log("D:", categoryData);
    if (categoryData.parentId === "!") {
      categoryData.parentId = null;
    }
    const data = {
      categoryName: categoryData.categoryName,
      parentId: categoryData.parentId,
    };
    try {
      const response = await categoryApi.updateCategory(categoryId, data);
      setCategoryList(response.data);
      setIsUpdateDialogOpen(false);
      toast.success("Cập nhật ngành hàng thành công");
    } catch (error) {
      toast.error("Có lỗi khi cập nhật ngành hàng");
    }
  }
  async function handleDeleteCategory(categoryId) {
    try {
      const response = await categoryApi.deleteCategory(categoryId);
      setCategoryList(response.data);
      setIsDeleteDialogOpen(false);
      toast.success("Xóa ngành hàng thành công");
    } catch (error) {
      toast.error("Có lỗi khi xóa ngành hàng");
    }
  }
  return {
    // ---------- Data ----------
    categoryList,
    categoryTree,
    productList,
    productListMetadata,

    // ---------- URL / Selection ----------
    selectedCategoryId,
    selectedCategory,
    searchParam,
    setSearchParam,
    setSelectedCategoryId,
    // ---------- Pagination ----------
    from,
    size,

    setFrom,

    // ---------- Dialog state ----------
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isUpdateDialogOpen,
    setIsUpdateDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,

    // ---------- Actions ----------
    getAllCategory,
    getAllProductOfCategory,

    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
}
