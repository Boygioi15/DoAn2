import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductTableToolbar({ selectedCount }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
      <div className="flex gap-3 items-center">
        <span className="text-sm text-muted-foreground font-medium">
          Đã chọn {selectedCount} sản phẩm
        </span>
        {selectedCount > 0 && (
          <>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Ban className="size-3.5" /> Dừng hoạt động
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Xóa
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Download className="size-3.5" /> Xuất dữ liệu
        </Button>
      </div>
      <Button
        size="sm"
        className="h-8 gap-2"
        onClick={() => navigate("/edit-product")}
      >
        <Plus className="size-4" /> Thêm sản phẩm mới
      </Button>
    </div>
  );
}
