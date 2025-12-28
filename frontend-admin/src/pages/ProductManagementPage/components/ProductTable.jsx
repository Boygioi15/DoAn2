import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PencilIcon, Trash2Icon, ArchiveRestore } from "lucide-react";
import { formatMoney } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function ProductTable({
  productList,
  selectedProductIds,
  toggleSelection,
  toggleSelectAll,
  currentTab,
  updateProductPublished,
  deleteProduct,
  restoreProduct,
}) {
  const navigate = useNavigate();
  const isSpecialView = currentTab === "deleted" || currentTab === "draft";
  const isAllSelected =
    productList.length > 0 && selectedProductIds.length === productList.length;

  if (productList.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Không có sản phẩm phù hợp
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="select-all"
              />
            </TableHead>
            <TableHead className="w-[300px]">Thông tin sản phẩm</TableHead>
            {!isSpecialView && (
              <>
                <TableHead>Ngành hàng</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Hoạt động</TableHead>
              </>
            )}
            {isSpecialView && <TableHead>Ghi chú</TableHead>}
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productList.map((product) => (
            <TableRow
              key={product.productId}
              data-state={
                selectedProductIds.includes(product.productId)
                  ? "selected"
                  : undefined
              }
            >
              <TableCell>
                <Checkbox
                  checked={selectedProductIds.includes(product.productId)}
                  onCheckedChange={() => toggleSelection(product.productId)}
                  aria-label={`select-${product.productId}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="rounded-md h-8 w-6">
                    <AvatarImage
                      src={product.thumbnailURL}
                      alt={product.name}
                    />
                    <AvatarFallback>SP</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium line-clamp-1">
                      {product.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      SKU: {product.sku}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Standard View Columns */}
              {!isSpecialView && (
                <>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {product.sellingPriceBot
                          ? formatMoney(product.sellingPriceBot)
                          : "Không xác định"}
                      </span>
                      {product.sellingPriceTop !== product.sellingPriceBot && (
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          -{" "}
                          {product.sellingPriceTop
                            ? formatMoney(product.sellingPriceTop)
                            : "Không xác định"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.inStorageTotal}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isPublished}
                      onCheckedChange={(checked) =>
                        updateProductPublished(product.productId, checked)
                      }
                    />
                  </TableCell>
                </>
              )}

              {/* Special View Columns (Draft/Deleted) */}
              {isSpecialView && (
                <TableCell>
                  <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md inline-block">
                    {currentTab === "deleted"
                      ? "Sẽ xóa vĩnh viễn sau 90 ngày"
                      : "Sản phẩm chưa được đăng bán"}
                  </div>
                </TableCell>
              )}

              {/* Actions */}
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  {currentTab !== "deleted" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`/edit-product/${product.productId}?edit=true`)
                      }
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  )}

                  {currentTab === "deleted" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ArchiveRestore className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Khôi phục sản phẩm?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Sản phẩm sẽ được chuyển về danh sách tạm ngưng.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => restoreProduct(product.productId)}
                          >
                            Khôi phục
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {currentTab === "deleted"
                            ? "Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn."
                            : "Sản phẩm sẽ được chuyển vào thùng rác."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProduct(product.productId)}
                        >
                          Xác nhận
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
