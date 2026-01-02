import { useContext } from "react";
import { OrderManagementPageContext } from "../OrderManagementPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "react-aria-components";
import { formatDate, formatMoney } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
// Import icons from lucide-react
import { CreditCard, MoreHorizontal, Pencil, Wallet } from "lucide-react"; // Only need CreditCard for online and Wallet for COD
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const paymentStateMap = {
  all: "Tất cả",
  created: "Mới tạo",
  pending: "Đang xử lý",
  succeeded: "Đã thành công",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

const deliveryStateMap = {
  all: "Tất cả",
  pending: "Đang chờ xử lý",
  ongoing: "Đang được giao",
  delivered: "Đã giao",
  succeeded: "Thành công",
  failed: "Thất bại",
  canceled: "Đã hủy",
};

const PAYMENT_STATUS_CONFIG = {
  created: {
    label: "Mới tạo",
    className: "w-28 bg-blue-50 text-blue-700 border-blue-200", // Added w-28
  },
  pending: {
    label: "Đang xử lý",
    className: "w-28 bg-yellow-50 text-yellow-700 border-yellow-200", // Added w-28
  },
  succeeded: {
    label: "Đã thành công",
    className: "w-28 bg-emerald-50 text-emerald-700 border-emerald-200", // Added w-28
  },
  failed: {
    label: "Thất bại",
    className: "w-28 bg-rose-50 text-rose-700 border-rose-200", // Added w-28
  },
  cancelled: {
    label: "Đã hủy",
    className: "w-28 bg-gray-50 text-gray-700 border-gray-200", // Added w-28
  },
};

const DELIVERY_STATUS_CONFIG = {
  pending: {
    label: "Đang chờ xử lý",
    className: "w-28 bg-yellow-50 text-yellow-700 border-yellow-200", // Added w-28
  },
  ongoing: {
    label: "Đang được giao",
    className: "w-28 bg-blue-50 text-blue-700 border-blue-200", // Added w-28
  },
  delivered: {
    label: "Đã giao",
    className: "w-28 bg-purple-50 text-purple-700 border-purple-200", // Added w-28
  },
  succeeded: {
    label: "Thành công",
    className: "w-28 bg-emerald-50 text-emerald-700 border-emerald-200", // Added w-28
  },
  failed: {
    label: "Thất bại",
    className: "w-28 bg-rose-50 text-rose-700 border-rose-200", // Added w-28
  },
  canceled: {
    label: "Đã hủy",
    className: "w-28 bg-gray-50 text-gray-700 border-gray-200", // Added w-28
  },
};

// Simplified PAYMENT_METHOD_CONFIG
const PAYMENT_METHOD_CONFIG = {
  online: {
    label: "ONL",
    icon: CreditCard,
    color: "text-blue-600",
  },
  cod: {
    label: "COD",
    icon: Wallet,
    color: "text-gray-600",
  },
};

export default function OrderTable() {
  const { orderList, setUpdateOrderDialogOpen, setSelectedOrderId } =
    useContext(OrderManagementPageContext);
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">
              <Checkbox aria-label="select-all" />
            </TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Tổng giá trị</TableHead>
            <TableHead className="text-center">Phương thức TT</TableHead>
            {/* New column */}
            <TableHead className="text-center">Trạng thái thanh toán</TableHead>
            <TableHead className="text-center">Trạng thái vận chuyển</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderList.map((order) => {
            const paymentStatusStyle =
              PAYMENT_STATUS_CONFIG[order.payment_state] ||
              PAYMENT_STATUS_CONFIG.created;
            const deliveryStatusStyle =
              DELIVERY_STATUS_CONFIG[order.delivery_state] ||
              DELIVERY_STATUS_CONFIG.pending;

            // Determine if it's COD or Online
            const methodType =
              order.payment_method === "cod" ? "cod" : "online";
            const paymentMethodDisplay = PAYMENT_METHOD_CONFIG[methodType];

            // Destructure icon and label for easier use
            const IconComponent = paymentMethodDisplay.icon;

            return (
              <TableRow key={order._id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{order._id.slice(0, 10)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="rounded-md h-8 w-8">
                      <AvatarImage
                        src={order.thumbnailURL}
                        alt={order.address_name}
                      />
                      <AvatarFallback>
                        {" "}
                        {order.reference_user
                          ? order.address_name?.slice(0, 2).toUpperCase()
                          : "? "}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {order.reference_user ? (
                        <Link
                          className="font-medium line-clamp-1 hover:underline"
                          to={"/user"}
                        >
                          {order.address_name}
                        </Link>
                      ) : (
                        <span className="font-medium line-clamp-1">
                          {order.address_name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        SĐT: {order.address_phone}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatMoney(order.payment_cashout_price)}
                </TableCell>
                {/* NEW PAYMENT METHOD CELL */}
                <TableCell>
                  <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                    <IconComponent
                      className={`h-4 w-4 ${paymentMethodDisplay.color}`}
                    />
                    <span>{paymentMethodDisplay.label}</span>
                  </div>
                </TableCell>
                {/* END NEW PAYMENT METHOD CELL */}
                <TableCell className={"text-center"}>
                  <Badge
                    variant="outline"
                    className={paymentStatusStyle.className}
                  >
                    {paymentStatusStyle.label}
                  </Badge>
                </TableCell>
                <TableCell className={"text-center"}>
                  <Badge
                    variant="outline"
                    className={deliveryStatusStyle.className}
                  >
                    {deliveryStatusStyle.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      console.log("HI");
                      setSelectedOrderId(order._id);
                      setUpdateOrderDialogOpen(true);
                    }}
                  >
                    <span className="sr-only">Thao tác với đơn hàng</span>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
