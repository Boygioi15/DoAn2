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
    const order =
      orderList.find((order) => order._id === selectedOrderId) || null;
    // console.log("OID: ", selectedOrderId, order);
    return order;
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

  const [isUpdatePaymentDialogOpen, setIsUpdatePaymentDialogOpen] =
    useState(false);
  const [isUpdateDeliveryDialogOpen, setIsUpdateDeliveryDialogOpen] =
    useState(false);
  const [newPaymentState, setNewPaymentState] = useState("");
  const [isUpdatingPaymentState, setIsUpdatingPaymentState] = useState(false);
  const [newDeliveryState, setNewDeliveryState] = useState("");
  const [isUpdatingDeliveryState, setIsUpdatingDeliveryState] = useState(false);

  // Set default payment state when dialog opens or selected order changes
  useEffect(() => {
    // console.log("SO: ", selectedOrder);
    if (isUpdatePaymentDialogOpen && selectedOrder) {
      setNewPaymentState(selectedOrder.payment_state || "");
    }
  }, [isUpdatePaymentDialogOpen, selectedOrder]);

  // Set default delivery state when dialog opens or selected order changes
  useEffect(() => {
    if (isUpdateDeliveryDialogOpen && selectedOrder) {
      setNewDeliveryState(selectedOrder.delivery_state || "");
    }
  }, [isUpdateDeliveryDialogOpen, selectedOrder]);

  const handleOnUpdatePaymentStateDialogClick = (newSelectedOrderId) => {
    setSelectedOrderId(newSelectedOrderId);
    setIsUpdatePaymentDialogOpen(true);
  };

  const handleUpdatePaymentState = async () => {
    try {
      setIsUpdatingPaymentState(true);
      await orderApi.updateOrderPaymentState(selectedOrderId, newPaymentState);
      toast.success("Cập nhật trạng thái thanh toán thành công");
      setIsUpdatePaymentDialogOpen(false);
      await getOrderList();
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi cập nhật trạng thái thanh toán");
    } finally {
      setIsUpdatingPaymentState(false);
    }
  };

  const handleOnUpdateDeliveryStateDialogClick = (newSelectedOrderId) => {
    setSelectedOrderId(newSelectedOrderId);
    setIsUpdateDeliveryDialogOpen(true);
  };

  const handleUpdateDeliveryState = async () => {
    try {
      setIsUpdatingDeliveryState(true);
      await orderApi.updateOrderDeliveryState(
        selectedOrderId,
        newDeliveryState
      );
      toast.success("Cập nhật trạng thái giao hàng thành công");
      setIsUpdateDeliveryDialogOpen(false);
      await getOrderList();
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi cập nhật trạng thái giao hàng");
    } finally {
      setIsUpdatingDeliveryState(false);
    }
  };
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

    isUpdateDeliveryDialogOpen,
    isUpdatePaymentDialogOpen,
    setIsUpdateDeliveryDialogOpen,
    setIsUpdatePaymentDialogOpen,
    handleOnUpdatePaymentStateDialogClick,
    handleOnUpdateDeliveryStateDialogClick,

    newPaymentState,
    setNewPaymentState,
    isUpdatingPaymentState,
    handleUpdatePaymentState,

    newDeliveryState,
    setNewDeliveryState,
    isUpdatingDeliveryState,
    handleUpdateDeliveryState,
  };
}
