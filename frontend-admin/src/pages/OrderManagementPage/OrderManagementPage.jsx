import useOrderManagement from "@/hooks/useOrderManagement";
import { createContext } from "react";
import OrderDeliveryTabSelection from "./components/OrderDeliveryStatusTabSelection";
import OrderFilterTab from "./components/OrderFilterTab";
import OrderTable from "./components/OrderTable";
import PaginationRow from "@/reusable-component/PaginationRow";
import UpdateOrderDialog from "./components/UpdateOrderDialog";
import UpdateOrderSheet from "./components/UpdateOrderDialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const paymentStateValueList = [
  { display: "Mới tạo", value: "created" },
  { display: "Đang xử lý", value: "pending" },
  { display: "Đã thành công", value: "succeeded" },
  { display: "Thất bại", value: "failed" },
  { display: "Đã hủy", value: "cancelled" },
];
const deliveryStateValueList = [
  { name: "Đang chờ xử lý", value: "pending" },
  { name: "Đang được giao", value: "ongoing" },
  { name: "Đã giao", value: "delivered" },
  { name: "Thành công", value: "succeeded" },
  { name: "Thất bại", value: "failed" },
  { name: "Đã hủy", value: "canceled" },
];
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
        {/* Update payment state dialog */}
        {orderManagementHook.selectedOrder &&
          orderManagementHook.isUpdatePaymentDialogOpen && (
            <Dialog
              open={orderManagementHook.isUpdatePaymentDialogOpen}
              onOpenChange={(open) =>
                orderManagementHook.setIsUpdatePaymentDialogOpen(open)
              }
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
                  <DialogDescription>
                    Cập nhật trạng thái thanh toán cho đơn hàng của người dùng
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label>Trạng thái thanh toán</Label>
                    <Select
                      value={orderManagementHook.newPaymentState}
                      onValueChange={orderManagementHook.setNewPaymentState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStateValueList.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        orderManagementHook.setIsUpdatePaymentDialogOpen(false)
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={orderManagementHook.handleUpdatePaymentState}
                      disabled={orderManagementHook.isUpdatingPaymentState}
                    >
                      {orderManagementHook.isUpdatingPaymentState
                        ? "Đang cập nhật..."
                        : "Cập nhật"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        {/* Update delivery state dialog */}
        {orderManagementHook.selectedOrder &&
          orderManagementHook.isUpdateDeliveryDialogOpen && (
            <Dialog
              open={orderManagementHook.isUpdateDeliveryDialogOpen}
              onOpenChange={(open) =>
                orderManagementHook.setIsUpdateDeliveryDialogOpen(open)
              }
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật trạng thái giao hàng</DialogTitle>
                  <DialogDescription>
                    Cập nhật trạng thái giao hàng cho đơn hàng của người dùng
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label>Trạng thái giao hàng</Label>
                    <Select
                      value={orderManagementHook.newDeliveryState}
                      onValueChange={orderManagementHook.setNewDeliveryState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryStateValueList.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        orderManagementHook.setIsUpdateDeliveryDialogOpen(false)
                      }
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={orderManagementHook.handleUpdateDeliveryState}
                      disabled={orderManagementHook.isUpdatingDeliveryState}
                    >
                      {orderManagementHook.isUpdatingDeliveryState
                        ? "Đang cập nhật..."
                        : "Cập nhật"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
