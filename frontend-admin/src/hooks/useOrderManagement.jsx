//order payment status tab: all, created, pending, succeeded, failed, cancelled
//order delivery status tab: all, pending, ongoing, delivered, succeeded, failed, canceled

import { useState } from "react";

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
  const [orderList, setOrderList] = useState(null);

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
  };
}
