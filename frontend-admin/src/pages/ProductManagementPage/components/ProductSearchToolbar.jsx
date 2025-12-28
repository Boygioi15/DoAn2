import {
  InputWithStartAddOn,
  SelectWithStartAddOn,
} from "@/reusable-component/Input";

export default function ProductSearchToolbar({
  queryName,
  querySku,
  setQuerySku,
  setQueryName,
  queryCategory,
  setQueryCategory,
  sortBy,
  setSortBy,
  stockState,
  setStockState,
  currentTab,
}) {
  const sortByValueList = [
    {
      value: "newest",
      display: "Mới nhất",
    },
    {
      value: "alphabetical-az",
      display: "Tên(A-Z)",
    },
    {
      value: "alphabetical-za",
      display: "Tên(Z-A)",
    },
  ];
  const stockStateValueList = [
    {
      value: "all",
      display: "Tất cả",
    },
    {
      value: "0",
      display: "Còn hàng",
    },
    {
      value: "1",
      display: "Hết hàng",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
      <InputWithStartAddOn
        addOnlabel="Tên SP"
        placeholder="Nhập tên sản phẩm..."
        inputValue={queryName}
        onInputValueChange={(e) => setQueryName(e.target.value)}
      />
      <InputWithStartAddOn
        addOnlabel="SKU SP"
        placeholder="Nhập sku sản phẩm..."
        inputValue={querySku}
        onInputValueChange={(e) => setQuerySku(e.target.value)}
      />
      {/* Only show Category filter if not in special tabs if needed, or always show */}
      {currentTab !== "deleted" && (
        <InputWithStartAddOn
          addOnlabel="Ngành hàng"
          placeholder="Tìm ngành hàng..."
          inputValue={queryCategory}
          onInputValueChange={(e) => setQueryCategory(e.target.value)}
        />
      )}

      <SelectWithStartAddOn
        addOnlabel="Sắp xếp"
        selectValue={sortBy}
        onSelectValueChange={setSortBy}
        selectValueList={sortByValueList}
        placeholder="Chọn cách sắp xếp"
      />
      <SelectWithStartAddOn
        addOnlabel="Tồn kho"
        selectValue={stockState}
        onSelectValueChange={setStockState}
        selectValueList={stockStateValueList}
        placeholder="Tất cả"
      />
    </div>
  );
}
