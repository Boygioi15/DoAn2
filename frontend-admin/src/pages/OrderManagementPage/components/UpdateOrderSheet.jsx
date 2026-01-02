import React, { useState, useEffect } from "react";
import {
  Sheet, // Changed from Dialog
  SheetContent, // Changed from DialogContent
  SheetHeader, // Changed from DialogHeader
  SheetTitle, // Changed from DialogTitle
  SheetDescription, // Changed from DialogDescription
  SheetFooter, // Changed from DialogFooter
  SheetClose, // Changed from DialogClose
} from "@/components/ui/sheet"; // Import from sheet
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatMoney } from "@/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Mappings for Select components ---
const paymentStateOptions = {
  created: "Mới tạo",
  pending: "Đang xử lý",
  succeeded: "Đã thành công",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

const deliveryStateOptions = {
  pending: "Đang chờ xử lý",
  ongoing: "Đang được giao",
  delivered: "Đã giao",
  succeeded: "Thành công",
  failed: "Thất bại",
  canceled: "Đã hủy",
};

// Simplified payment method display strings
const paymentMethodDisplayMap = {
  payos: "Thanh toán Online (PayOS)",
  card: "Thẻ Tín dụng/Ghi nợ",
  paypal: "PayPal",
  bank_transfer: "Chuyển khoản NH",
  cod: "Tiền mặt (COD)",
  // Add other specific methods if needed
};
// ------------------------------------

export default function UpdateOrderSheet({
  // Renamed component for consistency with file name
  order,
  isOpen,
  onOpenChange,
  onUpdateSuccess,
}) {
  const [currentPaymentState, setCurrentPaymentState] = useState(
    order?.payment_state || ""
  );
  const [currentDeliveryState, setCurrentDeliveryState] = useState(
    order?.delivery_state || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentPaymentState(order.payment_state);
      setCurrentDeliveryState(order.delivery_state);
    }
  }, [order]);

  if (!order) {
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Updating order:", order._id, {
      payment_state: currentPaymentState,
      delivery_state: currentDeliveryState,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Order updated successfully!");
      onUpdateSuccess?.(order._id, {
        payment_state: currentPaymentState,
        delivery_state: currentDeliveryState,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPayment = () => {
    console.log(`Cancelling payment for order ID: ${order._id}`);
    alert("Payment cancellation initiated!");
  };

  const handleCancelOrder = () => {
    console.log(`Cancelling entire order ID: ${order._id}`);
    alert("Order cancellation initiated!");
  };

  const displayedPaymentMethod =
    paymentMethodDisplayMap[order.payment_method] ||
    order.payment_method ||
    "Không rõ";

  return (
    // Changed to Sheet and SheetContent
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {/* sheetContent allows 'side' prop for direction and has scrollable classes */}
      <SheetContent side="right" className="w-[420px] px-6">
        <ScrollArea className={"h-screen"}>
          <SheetHeader className={"px-0!"}>
            <SheetTitle>Cập nhật Đơn hàng</SheetTitle>
            <SheetDescription>
              Chỉnh sửa thông tin và trạng thái đơn hàng.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Thông tin chung Đơn hàng
            </h3>

            {/* Each field on its own line */}
            <div className="grid gap-2">
              {" "}
              {/* Using simple grid gap for vertical stacking */}
              <Label htmlFor="orderId">Mã Đơn hàng</Label>
              <Input
                id="orderId"
                value={order._id}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="createdAt">Ngày tạo</Label>
              <Input
                id="createdAt"
                value={formatDate(order.createdAt)}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Tổng giá trị</Label>
              <Input
                id="totalAmount"
                value={formatMoney(order.payment_cashout_price)}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <Separator />
          {/* --- SECTION 2: User Info Section --- */}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Thông tin Khách hàng
            </h3>

            {/* Each field on its own line */}
            <div className="grid gap-2">
              <Label htmlFor="userName">Tên Khách hàng</Label>
              <Input
                id="userName"
                value={order.address_name}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userPhone">SĐT</Label>
              <Input
                id="userPhone"
                value={order.address_phone}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                value={order.email || "N/A"}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addressDetail">Địa chỉ</Label>
              <Input
                id="addressDetail"
                value={`${order.address_detail}, ${order.address_ward_name}, ${order.address_district_name}, ${order.address_province_name}`}
                disabled
                className="bg-slate-50 text-slate-500 h-auto"
              />
            </div>
          </div>
          <Separator />
          {/* --- SECTION 3: Action Section (Payment method, Payment state, Delivery state) --- */}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Cập nhật Trạng thái
            </h3>

            {/* Each field on its own line */}
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Phương thức TT</Label>
              <Input
                id="paymentMethod"
                value={displayedPaymentMethod}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentState">Trạng thái TT</Label>
              <Select
                value={currentPaymentState}
                onValueChange={setCurrentPaymentState}
              >
                <SelectTrigger id="paymentState">
                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentStateOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliveryState">Trạng thái VC</Label>
              <Select
                value={currentDeliveryState}
                onValueChange={setCurrentDeliveryState}
              >
                <SelectTrigger id="deliveryState">
                  <SelectValue placeholder="Chọn trạng thái vận chuyển" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(deliveryStateOptions).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* SheetFooter at the bottom, not part of scrollable content */}
          <SheetFooter className="mt-4 grid grid-cols-2 gap-2">
            <Button
              onClick={handleCancelPayment}
              variant="destructive"
              type="button"
            >
              Hủy Thanh toán
            </Button>
            <Button
              onClick={handleCancelOrder}
              variant="destructive"
              type="button"
            >
              Hủy Đơn hàng
            </Button>
          </SheetFooter>
        </ScrollArea>
        <Separator />
        {/* Added overflow-y-auto and flex-1 to make the content scrollable */}{" "}
        {/* Added pr-2 for scrollbar spacing */}
        {/* --- SECTION 1: General Order Section --- */}
      </SheetContent>
    </Sheet>
  );
}
