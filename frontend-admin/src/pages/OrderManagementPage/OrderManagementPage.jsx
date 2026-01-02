import useOrderManagement from "@/hooks/useOrderManagement";
import { createContext } from "react";
import OrderDeliveryTabSelection from "./components/OrderDeliveryStatusTabSelection";
import OrderFilterTab from "./components/OrderFilterTab";
import OrderTable from "./components/OrderTable";
import PaginationRow from "@/reusable-component/PaginationRow";
import UpdateOrderDialog from "./components/UpdateOrderSheet";
import UpdateOrderSheet from "./components/UpdateOrderSheet";

export const OrderManagementPageContext = createContext();
export default function OrderManagementPage() {
  const orderManagementHook = useOrderManagement();

  return (
    <OrderManagementPageContext.Provider value={orderManagementHook}>
      <div className="page-layout ">
        {" "}
        <OrderDeliveryTabSelection />
        <OrderFilterTab />
        <div className={reusableStyle.block}>
          {orderManagementHook.orderList &&
          orderManagementHook.orderList.length > 0 ? (
            <>
              <OrderTable />
              <PaginationRow
                from={orderManagementHook.from}
                size={orderManagementHook.size}
                onFromChange={orderManagementHook.setFrom}
                onSizeChange={orderManagementHook.setSize}
                totalItem={orderManagementHook.orderListMetadata.totalItem}
                itemName={"Đơn hàng"}
              />
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Không có đơn hàng phù hợp
            </div>
          )}
        </div>
        {orderManagementHook.selectedOrder && (
          <UpdateOrderSheet
            order={orderManagementHook.selectedOrder}
            isOpen={orderManagementHook.updateOrderDialogOpen}
            onOpenChange={(open) =>
              orderManagementHook.setUpdateOrderDialogOpen(open)
            }
          />
        )}
      </div>
    </OrderManagementPageContext.Provider>
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
