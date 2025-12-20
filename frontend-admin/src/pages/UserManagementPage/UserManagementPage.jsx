import React, { createContext, useState } from "react";
import { useCustomerManagement } from "@/hooks/useCustomerManagement";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileSpreadsheet } from "lucide-react"; // Changed icon to Spreadsheet for Excel
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Components
import { CustomerTable } from "./components/CustomerTable";
import { CustomerDetailPanel } from "./components/CustomerDetailPanel";
import { InputWithStartAddOn } from "@/reusable-component/Input";
import { SelectWithStartAddOn } from "@/reusable-component/Select";
import CustomerSearchToolbar from "./components/CustomerSearchToolbar";
import CustomerPagination from "@/reusable-component/PaginationRow";

const customerLocalContext = createContext();

export default function UserManagementPage() {
  const {
    filteredCustomerList,
    metadata,
    isLoading,

    selectedCustomerId,
    setSelectedCustomerId,
    customerDetail,

    queryEmail,
    queryName,
    queryPhone,
    from,
    size,
    sortBy,

    setQueryEmail,
    setQueryName,
    setQueryPhone,
    setFrom,
    setSize,
    setSortBy,

    handleBanUser,
    handleUnbanUser,

    getUserDetail,
  } = useCustomerManagement();
  return (
    <div className={reusableStyle.page}>
      <div className={reusableStyle.block}>
        <h2>Tìm kiếm người dùng</h2>
        <CustomerSearchToolbar
          queryName={queryName}
          queryPhone={queryPhone}
          queryEmail={queryEmail}
          onQueryEmailChange={setQueryEmail}
          onQueryPhoneChange={setQueryPhone}
          onQueryNameChange={setQueryName}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>
      <div className={reusableStyle.block}>
        {/* LEFT: List View */}
        <div className="flex-1 flex flex-col min-w-0 gap-4 transition-all duration-300 ease-in-out">
          <div
            className={
              customerDetail ? "grid grid-cols-[7fr_3fr] gap-4" : "flex w-full"
            }
          >
            <div className="flex flex-col gap-2 w-full">
              <CustomerTable
                data={filteredCustomerList}
                startIndex={(from - 1) * size}
                selectedId={selectedCustomerId}
                onRowClick={setSelectedCustomerId}
                onBan={(userId) => handleBanUser(userId)}
                onUnban={(userId) => handleUnbanUser(userId)}
              />
              <CustomerPagination
                from={from}
                size={size}
                onFromChange={setFrom}
                onSizeChange={setSize}
                totalItem={metadata.totalItem}
                itemName={"Người dùng"}
              />
            </div>

            {customerDetail && (
              <div
                className={cn(
                  "relative max-h-150  border-l border-slate-200 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
                  customerDetail
                    ? "w-[full] rounded-l-lg" // Slightly wider for e-commerce details
                    : "w-0 opacity-0 border-none"
                )}
              >
                {customerDetail && (
                  <CustomerDetailPanel
                    user={customerDetail}
                    onClose={() => setSelectedCustomerId(null)}
                    onBan={() => handleBanUser(customerDetail.userId)}
                    onUnban={() => handleUnbanUser(customerDetail.userId)}
                    getUserDetail={getUserDetail}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const reusableStyle = {
  page: "flex flex-col gap-6 mt-6",
  block:
    "flex flex-col p-4 gap-4 rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  summaryBlock: "flex flex-col gap-6 w-full bg-blue-50 rounded-[4px] p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
