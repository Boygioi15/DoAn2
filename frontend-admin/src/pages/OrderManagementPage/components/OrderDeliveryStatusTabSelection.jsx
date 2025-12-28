import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { OrderManagementPageContext } from "../OrderManagementPage";
//order delivery status tab: all, pending, ongoing, delivered, succeeded, failed, canceled

const tabSelectionList = [
  { name: "Tất cả", value: "all" },
  { name: "Đang chờ xử lý", value: "pending" },
  { name: "Đang được giao", value: "ongoing" },
  { name: "Đã giao", value: "delivered" },
  { name: "Thành công", value: "succeeded" },
  { name: "Thất bại", value: "failed" },
  { name: "Đã hủy", value: "canceled" },
];

export default function OrderDeliveryTabSelection() {
  const { orderDeliveryStatusTab, setOrderDeliveryStatusTab } = useContext(
    OrderManagementPageContext
  );
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto">
        {tabSelectionList.map((tab) => (
          <Button
            key={tab.value}
            className={`rounded-none border-b-2 px-2 pb-2 pt-2 h-auto hover:bg-transparent text-[16px] ${
              orderDeliveryStatusTab === tab.value
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            variant="ghost"
            onClick={() => setOrderDeliveryStatusTab(tab.value)}
          >
            {tab.name}
          </Button>
        ))}
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
