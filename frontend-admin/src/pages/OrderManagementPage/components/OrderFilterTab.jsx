import { useContext } from "react";
import { OrderManagementPageContext } from "../OrderManagementPage";
import { Label } from "@/components/ui/label";
import {
  DateSelectWithStartAddOn,
  InputWithStartAddOn,
  SelectWithStartAddOn,
} from "@/reusable-component/Input";

const paymentStateValueList = [
  { display: "Tất cả", value: "all" },
  { display: "Mới tạo", value: "created" },
  { display: "Đang xử lý", value: "pending" },
  { display: "Đã thành công", value: "succeeded" },
  { display: "Thất bại", value: "failed" },
  { display: "Đã hủy", value: "cancelled" },
];
const userAuthorizedValueList = [
  { display: "Tất cả", value: "all" },
  { display: "Đã đăng nhập", value: "authorized" },
  { display: "Ẩn danh", value: "anonymous" },
];
export default function OrderFilterTab() {
  const {
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
  } = useContext(OrderManagementPageContext);

  return (
    <div className={reusableStyle.block}>
      <div className="grid grid-cols-[100px_1fr] gap-2 w-full">
        <Label>Người dùng</Label>
        <div className="grid grid-cols-3 gap-2 w-full">
          <InputWithStartAddOn
            addOnlabel={"Tên người đặt"}
            placeholder={"Tên người đặt"}
            inputValue={filterUser.userName}
            onInputValueChange={(value) =>
              setFilterUser((prev) => ({ ...prev, userName: value }))
            }
          />
          <InputWithStartAddOn
            addOnlabel={"SĐT người đặt"}
            placeholder={"SĐT người đặt"}
            inputValue={filterUser.userPhone}
            onInputValueChange={(value) =>
              setFilterUser((prev) => ({ ...prev, userPhone: value }))
            }
          />
          <SelectWithStartAddOn
            addOnlabel={"Lọc đăng nhập"}
            placeholder={"SĐT người đặt"}
            selectValue={filterUser.userAuthorized}
            selectValueList={userAuthorizedValueList}
            onSelectValueChange={(value) =>
              setFilterUser((prev) => ({
                ...prev,
                userAuthorized: value,
              }))
            }
          />
        </div>
        <Label>Ngày đặt</Label>
        <div className="grid grid-cols-3 gap-2 w-full">
          <DateSelectWithStartAddOn
            addOnLabel={"Từ ngày"}
            placeholder={"Hôm nay"}
            inputValue={filterDate.fromDate}
            onInputValueChange={(value) =>
              setFilterDate((prev) => ({ ...prev, fromDate: value }))
            }
          />
          <DateSelectWithStartAddOn
            addOnLabel={"Đến ngày"}
            placeholder={"Hôm nay"}
            inputValue={filterDate.toDate}
            onInputValueChange={(value) =>
              setFilterDate((prev) => ({ ...prev, toDate: value }))
            }
          />
        </div>
        <Label>Hóa đơn</Label>
        <div className="grid grid-cols-3 gap-2 w-full">
          <InputWithStartAddOn
            addOnlabel={"Mã đơn hàng"}
            placeholder={"Mã đơn hàng"}
            inputValue={filterOrder.orderId}
            onInputValueChange={(value) =>
              setFilterOrder((prev) => ({ ...prev, orderId: value }))
            }
          />
          <SelectWithStartAddOn
            addOnlabel={"Tình trạng thanh toán"}
            defaultValue={"all"}
            selectValue={filterOrder.paymentState}
            selectValueList={paymentStateValueList}
            onSelectValueChange={(value) =>
              setFilterOrder((prev) => ({ ...prev, paymentState: value }))
            }
          />
        </div>
      </div>
    </div>
  );
}
const reusableStyle = {
  page: "flex flex-col gap-6 mt-6 bg-gray-100",
  block:
    "flex flex-col p-4 gap-4 rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  summaryBlock: "flex flex-col gap-6 w-full bg-blue-50 rounded-[4px] p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
