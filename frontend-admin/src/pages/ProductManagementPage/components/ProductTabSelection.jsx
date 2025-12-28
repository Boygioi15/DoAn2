import { Button } from "@/components/ui/button";

const tableSelectionList = [
  { name: "Tất cả", value: "all" },
  { name: "Đang hoạt động", value: "published" },
  { name: "Đã tạm ngưng", value: "not-published" },
  { name: "Đã xóa", value: "deleted" },
  { name: "Bản nháp", value: "draft" },
];

export default function ProductTabSelection({ currentTab, setTab }) {
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto">
        {tableSelectionList.map((tab) => (
          <Button
            key={tab.value}
            className={`rounded-none border-b-2 px-2 pb-2 pt-2 h-auto hover:bg-transparent text-[16px] ${
              currentTab === tab.value
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            variant="ghost"
            onClick={() => setTab(tab.value)}
          >
            {tab.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
