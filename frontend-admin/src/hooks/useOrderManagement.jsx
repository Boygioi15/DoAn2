//order payment status tab: all, created, pending, succeeded, failed, cancelled
//order delivery status tab: all, pending, ongoing, delivered, succeeded, failed, canceled

import orderApi from "@/api/orderApi";
import { buildQueryStringFromObject } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const defaultFilterDate = {
  fromDate: "",
  toDate: "",
};
const defaultFilterOrder = {
  orderId: "",
  paymentState: "all",
};
const defaultFilterUser = {
  userName: "",
  userPhone: "",
  userAuthorized: "all",
};
export default function useOrderManagement() {
  const [orderDeliveryStatusTab, setOrderDeliveryStatusTab] = useState("all");
  const [orderList, setOrderList] = useState([]);
  const [orderListMetadata, setOrderListMetadata] = useState({ totalItem: 0 });

  //filter and pagination
  //filter
  const [filterDate, setFilterDate] = useState(defaultFilterDate);
  const [filterOrder, setFilterOrder] = useState(defaultFilterOrder);
  const [filterUser, setFilterUser] = useState(defaultFilterUser);
  //pagination
  const [from, setFrom] = useState(1);
  const [size, setSize] = useState(10);
  //sort
  const [sortBy, setSortBy] = useState("newest");
  //re-fetch database when filter is called
  const [orderListLoading, setOrderListLoading] = useState(false);
  const [updateOrderDialogOpen, setUpdateOrderDialogOpen] = useState(false);
  //selected order
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const selectedOrder = useMemo(() => {
    return orderList.find((order) => order._id === selectedOrderId) || null;
  }, [selectedOrderId]);
  const getOrderList = async () => {
    try {
      setOrderListLoading(true);
      const queryString = formQueryString();
      const response = await orderApi.getOrderList(queryString);
      // console.log("RES: ", response);
      setOrderList(response.data.orderList);
      setOrderListMetadata({ totalItem: response.data.totalItem });
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi lấy dữ liệu đơn hàng");
    } finally {
      setOrderListLoading(false);
    }
  };
  const formQueryString = () => {
    const rawQueryObject = {
      deliveryState: orderDeliveryStatusTab,
      paymentState: filterOrder.paymentState,

      userName: filterUser.userName,
      userPhone: filterUser.userPhone,
      userAuthorized: filterUser.userAuthorized,
      fromDate: filterDate.fromDate,
      toDate: filterDate.toDate,
      orderId: filterOrder.orderId,

      size,
      from,
      sortBy,
    };
    const queryObject = Object.fromEntries(
      Object.entries(rawQueryObject).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    const qString = buildQueryStringFromObject(queryObject);
    return qString;
  };
  useEffect(() => {
    getOrderList();
  }, [
    orderDeliveryStatusTab,
    filterDate,
    filterOrder,
    filterUser,
    from,
    size,
    sortBy,
  ]);

  return {
    orderDeliveryStatusTab,
    setOrderDeliveryStatusTab,

    filterDate,
    setFilterDate,
    filterOrder,
    setFilterOrder,
    filterUser,
    setFilterUser,

    sortBy,
    setSortBy,

    from,
    setFrom,
    size,
    setSize,

    getOrderList,
    formQueryString,
    orderListLoading,

    orderList,
    orderListMetadata,
    selectedOrderId,
    setSelectedOrderId,
    selectedOrder,

    updateOrderDialogOpen,
    setUpdateOrderDialogOpen,
  };
}
