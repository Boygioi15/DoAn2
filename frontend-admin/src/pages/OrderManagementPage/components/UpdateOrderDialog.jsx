import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UpdateOrderDialog({
  open,
  setOpen,
  order,
  handlePaymentStateSubmit,
  handleDeliveryStateSubmit,
}) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật đơn hàng</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
