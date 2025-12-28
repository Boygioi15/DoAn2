import { useState, useEffect, useCallback, useMemo } from "react";
import { productApi } from "@/api/productApi";
import { toast } from "sonner";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { buildQueryStringFromObject } from "@/utils";

export const useProductManagement = () => {
  const [searchParam, setSearchParam] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname;

  const [productList, setProductList] = useState([]);
  const [productListMetadata, setProductListMetadata] = useState({
    totalItem: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // --- 1. Stable URL Params (useMemo) ---
  // We memoize these so they don't trigger re-renders in child components
  const from = useMemo(
    () => Number(searchParam.get("from")) || 1,
    [searchParam]
  );
  const size = useMemo(
    () => Number(searchParam.get("size")) || 10,
    [searchParam]
  );
  const currentTab = useMemo(
    () => searchParam.get("tab") || "all",
    [searchParam]
  );
  const queryName = useMemo(
    () => searchParam.get("queryName") || "",
    [searchParam]
  );
  const queryCategory = useMemo(
    () => searchParam.get("queryCategory") || "",
    [searchParam]
  );
  const querySku = useMemo(
    () => searchParam.get("querySku") || "",
    [searchParam]
  );
  const queryStockState = useMemo(() => searchParam.get("stockState") || "all");
  const sortBy = useMemo(
    () => searchParam.get("sortBy") || "newest",
    [searchParam]
  );
  const tab = useMemo(() => searchParam.get("tab") || "all", [searchParam]);

  // --- 2. Helper to update URL ---
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParam);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset pagination on filter change
      if (name !== "from" && name !== "size") {
        params.set("from", "1");
      }
      return params.toString();
    },
    [searchParam]
  );

  // --- 3. Setters ---
  const setTab = (tabValue) => {
    navigate(`${pathName}?${createQueryString("tab", tabValue)}`, {
      push: true,
    });
    setSelectedProductIds([]);
  };
  const setStockState = (stockState) => {
    navigate(`${pathName}?${createQueryString("stockState", stockState)}`);
  };
  const setFrom = (val) =>
    navigate(`${pathName}?${createQueryString("from", val)}`);
  const setSize = (val) =>
    navigate(`${pathName}?${createQueryString("size", val)}`);

  // Use replace: true for inputs to avoid cluttering browser history while typing
  const setQueryName = (val) =>
    navigate(`${pathName}?${createQueryString("queryName", val)}`, {
      replace: true,
    });
  const setQueryCategory = (val) =>
    navigate(`${pathName}?${createQueryString("queryCategory", val)}`, {
      replace: true,
    });
  const setQuerySku = (val) =>
    navigate(`${pathName}?${createQueryString("querySku", val)}`, {
      replace: true,
    });
  const setSortBy = (val) =>
    navigate(`${pathName}?${createQueryString("sortBy", val)}`, {
      replace: true,
    });

  // --- 4. API Call ---
  const getProductList = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryObject = {
        queryProductName: queryName,
        queryCategoryName: queryCategory,
        queryProductSku: querySku,
        sortBy: sortBy,
        size: size,
        from: from,
        productTab: tab,
        stockState: queryStockState,
      };

      const qString = buildQueryStringFromObject(queryObject);
      const response = await productApi.getProductList(qString);

      setProductList(response.data.productList || []);
      setProductListMetadata({
        totalItem: response.data.metadata?.totalItem || 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi lấy danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [searchParam]);
  // ^ Dependency array now uses specific values, not the whole searchParam object

  // --- 5. Effect to fetch data ---
  useEffect(() => {
    getProductList();
    // We depend on the stable string representation of params to avoid infinite loops
  }, [getProductList]);

  // --- Actions ---
  const updateProductPublished = async (productId, checked) => {
    try {
      await productApi.updateProductPublished(productId, checked);
      setProductList((prev) =>
        prev.map((p) =>
          p.productId === productId ? { ...p, isPublished: checked } : p
        )
      );
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Có lỗi khi cập nhật");
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productApi.deleteProduct(productId);
      getProductList(); // Refresh list
      toast.success("Xóa sản phẩm thành công");
    } catch (error) {
      toast.error("Có lỗi khi xóa sản phẩm");
    }
  };

  const restoreProduct = async (productId) => {
    try {
      await productApi.restoreProduct(productId);
      getProductList(); // Refresh list
      toast.success("Khôi phục sản phẩm thành công");
    } catch (error) {
      toast.error("Có lỗi khi khôi phục sản phẩm");
    }
  };

  const toggleSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === productList.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(productList.map((p) => p.productId));
    }
  };

  return {
    productList,
    productListMetadata,
    isLoading,

    // Values
    tab,
    from,
    size,
    currentTab,
    queryName,
    queryCategory,
    querySku,
    queryStockState,
    sortBy,

    selectedProductIds,

    // Functions
    toggleSelection,
    toggleSelectAll,
    setTab,
    setStockState,
    setQueryName,
    setQueryCategory,
    setQuerySku,
    setSortBy,
    setFrom,
    setSize,
    updateProductPublished,
    deleteProduct,
    restoreProduct,
    refreshData: getProductList,
  };
};
