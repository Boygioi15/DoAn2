import useOrderManagement from "@/hooks/useOrderManagement";
import { createContext } from "react";
import OrderDeliveryTabSelection from "./components/OrderDeliveryStatusTabSelection";
import OrderFilterTab from "./components/OrderFilterTab";

export const OrderManagementPageContext = createContext();
export default function OrderManagementPage() {
  const orderManagementHook = useOrderManagement();
  return (
    <OrderManagementPageContext.Provider value={orderManagementHook}>
      <div className="page-layout ">
        {" "}
        <OrderDeliveryTabSelection />
        <OrderFilterTab />
      </div>
    </OrderManagementPageContext.Provider>
  );
}
