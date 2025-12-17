// hooks/useCustomer.js
import { useState, useEffect, useCallback, useMemo } from "react";
import userApi from "@/api/userApi"; // Keeping your existing API import
import { toast } from "sonner";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export const useCustomer = () => {
  const [searchParam, setSearchParam] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname;

  const [customerList, setCustomerList] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination & Filter State
  const from = useMemo(() => searchParam.get("from")) || 1;
  const size = useMemo(() => Number(searchParam.get("size"))) || 10;
  const queryName = useMemo(() => searchParam.get("queryName")) || "";
  const queryEmail = useMemo(() => searchParam.get("queryEmail")) || "";
  const queryPhone = useMemo(() => searchParam.get("queryPhone")) || "";
  const sortBy = useMemo(() => searchParam.get("sortBy")) || "newest";

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParam);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      //UX
      if (name !== "from") {
        params.set("from", "1");
      }
      return params.toString();
    },
    [searchParam]
  );
  //working in junction with history
  const setQueryName = (query) => {
    navigate(`${pathName}?${createQueryString("queryName", query)}`, {
      replace: true,
    });
  };
  const setQueryEmail = (query) => {
    navigate(`${pathName}?${createQueryString("queryEmail", query)}`, {
      replace: true,
    });
  };
  const setQueryPhone = (query) => {
    navigate(`${pathName}?${createQueryString("queryPhone", query)}`, {
      replace: true,
    });
  };
  const setFrom = (from) => {
    navigate(`${pathName}?${createQueryString("from", from)}`, {
      push: true,
    });
  };
  const setSize = (size) => {
    navigate(`${pathName}?${createQueryString("size", size)}`, {
      push: true,
    });
  };
  const setSortBy = (sortBy) => {
    router.push(`${pathName}?${createQueryString("sortBy", sortBy)}`);
  };

  const [metadata, setMetadata] = useState({
    totalItem: 0,
  });

  const getCustomer = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, ensure you pass role='customer' to backend
      const response = await userApi.getAllUsers({
        role: "customer", // Filter for customers only
      });
      setCustomerList(response.data.allUser);
      setMetadata({
        totalItem: response.data.allUser.length,
      });
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi tải danh sách khách hàng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCustomer();
  }, []);

  const filteredCustomerList = useMemo(() => {
    if (!customerList) return null;
    let newList = [...customerList];
    newList = newList
      .filter((customer) => customer.name.toLowerCase().includes(queryName))
      .filter((customer) => customer.email.toLowerCase().includes(queryEmail))
      .filter((customer) => customer.phone.toLowerCase().includes(queryPhone));
    console.log("OL: ", customerList);
    console.log("NL: ", newList);
    return newList;
  }, [customerList, searchParam]);

  // Derived state for the detail panel
  const customerDetail = customerList
    ? customerList.find((customer) => customer.userId === selectedCustomerId)
    : null;

  // Admin action: Ban/Unban
  const handleBanUser = async (userId) => {
    try {
      await userApi.banUser(userId);
      toast.success("Đã khóa tài khoản người dùng");
      await getCustomer();
    } catch (e) {
      toast.error("Thao tác thất bại");
    }
  };
  const handleUnbanUser = async (userId) => {
    try {
      await userApi.unbanUser(userId);
      toast.success("Đã mở khóa tài khoản người dùng");
      await getCustomer();
    } catch (e) {
      toast.error("Thao tác thất bại");
    }
  };
  const getUserDetail = async (userId) => {
    try {
      return await userApi.getUserDetail(userId);
    } catch (e) {
      console.log(e);
      toast.error("Có lỗi khi lấy thông tin chi tiết người dùng");
    }
  };
  return {
    filteredCustomerList,

    metadata,
    from,
    size,
    queryName,
    queryEmail,
    queryPhone,
    sortBy,

    isLoading,

    selectedCustomerId,
    setSelectedCustomerId,

    customerDetail,

    setQueryEmail,
    setQueryName,
    setQueryPhone,
    setFrom,
    setSize,
    setSortBy,

    handleBanUser,
    handleUnbanUser,

    getUserDetail,
  };
};
