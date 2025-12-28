import React from "react";
import { useProductManagement } from "@/hooks/useProductManagement";
import ProductOverview from "./components/ProductOverview";
import ProductTabSelection from "./components/ProductTabSelection";
import ProductSearchToolbar from "./components/ProductSearchToolbar";
import ProductTableToolbar from "./components/ProductTableToolbar";
import ProductTable from "./components/ProductTable";
import PaginationRow from "@/reusable-component/PaginationRow";

export default function ProductManagementPage() {
  const productHook = useProductManagement();

  return (
    <div className="page-layout ">
      {/* Overview Section */}
      {/* <div className={reusableStyle.block}>
        <ProductOverview productList={productHook.productList} />
      </div> */}
      <div>
        <ProductTabSelection
          currentTab={productHook.currentTab}
          setTab={productHook.setTab}
        />
      </div>
      <div className={reusableStyle.block}>
        <ProductSearchToolbar
          queryName={productHook.queryName}
          setQueryName={productHook.setQueryName}
          queryCategory={productHook.queryCategory}
          setQueryCategory={productHook.setQueryCategory}
          querySku={productHook.querySku}
          setQuerySku={productHook.setQuerySku}
          sortBy={productHook.sortBy}
          setSortBy={productHook.setSortBy}
          stockState={productHook.stockState}
          setStockState={productHook.setStockState}
          currentTab={productHook.currentTab}
        />
      </div>
      {/* Main Content Block */}
      <div className={reusableStyle.block}>
        <ProductTableToolbar
          selectedCount={productHook.selectedProductIds.length}
        />

        <ProductTable
          productList={productHook.productList}
          selectedProductIds={productHook.selectedProductIds}
          toggleSelection={productHook.toggleSelection}
          toggleSelectAll={productHook.toggleSelectAll}
          currentTab={productHook.currentTab}
          // Pass actions
          updateProductPublished={productHook.updateProductPublished}
          deleteProduct={productHook.deleteProduct}
          restoreProduct={productHook.restoreProduct}
        />
        {productHook.productList && productHook.productList.length > 0 && (
          <PaginationRow
            from={productHook.from}
            size={productHook.size}
            onFromChange={productHook.setFrom}
            onSizeChange={productHook.setSize}
            totalItem={productHook.productListMetadata.totalItem}
            itemName={"Sản phẩm"}
          />
        )}
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
