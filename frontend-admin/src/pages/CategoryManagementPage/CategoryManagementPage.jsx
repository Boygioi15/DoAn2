import { TreeView } from "@/components/tree-view";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import useCategoryManagement from "@/hooks/useCategoryManagement";
import BriefProductCard from "@/reusable-component/BriefProductCard";
import ComboBoxWithSearch from "@/reusable-component/ComboboxWithSearch";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  PackageOpen,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const pageSize = 24;
export default function CategoryManagementPage() {
  const categoryHook = useCategoryManagement();
  return (
    <div className="page-layout">
      {categoryHook.categoryTree && (
        <div className="grid grid-cols-[40%_60%] gap-4 ">
          <div
            className={
              reusableStyle.inputBlock +
              " shadow-xl overflow-scroll max-h-[700px]"
            }
          >
            <div className="flex flex-col sticky -top-5 bg-white z-10 gap-4 leading-6">
              <h2>Danh sách ngành hàng</h2>
              <div className="flex gap-2 ">
                <div className="relative grow">
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                    <Search className="size-4" />
                    <span className="sr-only">Tìm kiếm</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="Tìm kiếm ngành hàng"
                    className="peer pl-9"
                  />
                </div>
                <Dialog
                  open={categoryHook.isCreateDialogOpen}
                  onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                  }}
                >
                  <DialogTrigger
                    onClick={() => setIsCreateDialogOpen(true)}
                    asChild
                  >
                    <Button variant={"outline"}>
                      <Plus />
                    </Button>
                  </DialogTrigger>
                  <CreateNewCategoryForm
                    allCategories={categoryHook.categoryList}
                    handleAddCategory={categoryHook.handleCreateCategory}
                  />
                </Dialog>

                <Dialog
                  open={categoryHook.isUpdateDialogOpen}
                  onOpenChange={(open) => {
                    setIsUpdateDialogOpen(open);
                  }}
                >
                  <DialogTrigger
                    onClick={() => setIsUpdateDialogOpen(true)}
                    asChild
                  >
                    <Button variant={"outline"}>
                      <Edit />
                    </Button>
                  </DialogTrigger>
                  <UpdateCategoryForm
                    allCategories={categoryHook.categoryList}
                    handleUpdateCategory={categoryHook.handleUpdateCategory}
                  />
                </Dialog>

                <Dialog
                  open={categoryHook.isDeleteDialogOpen}
                  onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                  }}
                >
                  <DialogTrigger
                    onClick={() => setIsDeleteDialogOpen(true)}
                    asChild
                  >
                    <Button variant={"outline"}>
                      <Trash />
                    </Button>
                  </DialogTrigger>
                  <DeleteCategoryForm
                    allCategories={categoryHook.categoryList}
                    handleDeleteCategory={categoryHook.handleDeleteCategory}
                  />
                </Dialog>
              </div>
            </div>

            <div className="border border-border pt-2 rounded-s text-[14px] ">
              <TreeView
                data={categoryHook.categoryTree}
                expandAll
                onSelectChange={(item) => {
                  if (!item.children) {
                    categoryHook.setSelectedCategoryId(item.id);
                  }
                }}
              />
            </div>
          </div>

          <div
            className={`${reusableStyle.inputBlock} flex flex-col h-full overflow-hidden`}
          >
            {/* --- Header Section --- */}
            <div className="flex flex-col gap-4 pb-4 border-b mb-4 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Sản phẩm thuộc danh mục
                    {categoryHook.productList?.length > 0 && (
                      <Badge variant="secondary" className="rounded-full px-2">
                        {categoryHook.productList.length}
                      </Badge>
                    )}
                  </h2>
                  {categoryHook.selectedCategory ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Đang xem:{" "}
                      <span className="font-medium text-foreground">
                        {categoryHook.selectedCategory.categoryName}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Chưa chọn danh mục
                    </p>
                  )}
                </div>
              </div>

              {/* --- Toolbar (Search & Filter) --- */}
              {categoryHook.productList &&
                categoryHook.productList.length > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Tìm sản phẩm trong danh mục này..."
                        className="pl-8 h-9 bg-muted/30"
                      />
                    </div>

                    {/* Compact Pagination */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={categoryHook.from === 1}
                        onClick={() => {
                          const cFrom = categoryHook.from;
                          categoryHook.getAllProductOfCategory(
                            categoryHook.selectedCategoryId,
                            cFrom - 1
                          );
                          categoryHook.setFrom(cFrom - 1);
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[3rem] text-center">
                        {categoryHook.from} /{" "}
                        {Math.ceil(
                          categoryHook.productListMetadata.totalItem /
                            categoryHook.size
                        )}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={
                          categoryHook.from ===
                          Math.ceil(
                            categoryHook.productListMetadata.totalItem /
                              categoryHook.size
                          )
                        }
                        onClick={() => {
                          const cFrom = categoryHook.from;
                          categoryHook.getAllProductOfCategory(
                            categoryHook.selectedCategoryId,
                            cFrom + 1
                          );
                          categoryHook.setFrom(cFrom + 1);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
            </div>

            {/* --- Content Section --- */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* Case 1: No Category Selected */}
              {!categoryHook.selectedCategory && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Filter className="w-12 h-12 mb-2" />
                  <p>Vui lòng chọn một ngành hàng bên trái</p>
                </div>
              )}

              {/* Case 2: Category Selected but Empty */}
              {categoryHook.selectedCategory &&
                categoryHook.productList?.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="bg-muted/30 p-4 rounded-full mb-3">
                      <PackageOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg">Chưa có sản phẩm</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
                      Ngành hàng này hiện chưa có sản phẩm nào được liên kết.
                    </p>
                    <Button variant="outline">Thêm sản phẩm ngay</Button>
                  </div>
                )}

              {/* Case 3: Has Products */}
              {categoryHook.productList &&
                categoryHook.productList.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {categoryHook.productList.map((product) => (
                      <BriefProductCard briefProduct={product} />
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function CreateNewCategoryForm({ allCategories, handleAddCategory }) {
  const [categoryName, setCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  const allParentCategories = useMemo(() => {
    let newList = [...allCategories];
    (newList = newList.filter(
      (category) => category.categoryName !== "Không xác định"
    )),
      newList.push({ categoryName: "Không", categoryId: "!" });
    return newList;
  }, [allCategories]);

  function buildNameRecursively(category) {
    if (!category.parentId) {
      return category.categoryName;
    }
    const parent = allParentCategories.find(
      (element) => element.categoryId === category.parentId
    );
    if (!parent) {
      return category.categoryName;
    }
    return buildNameRecursively(parent) + " > " + category.categoryName;
  }
  // console.log("SP: ", selectedParentId);
  return (
    <DialogContent>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddCategory({
            categoryName: categoryName,
            parentId: selectedParentId,
          });
        }}
      >
        <DialogHeader>
          <DialogTitle>Thêm ngành hàng mới</DialogTitle>
          <DialogDescription>Thêm ngành hàng mới</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label>Tên ngành hàng</Label>
            <Input
              placeholder="Nhập tên ngành hàng"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label>Ngành hàng cha</Label>
            <ComboBoxWithSearch
              textPlaceholder="Chọn ngành hàng cha"
              optionPlaceHolder="Tìm kiếm ngành hàng cha"
              comboboxValue={selectedParentId}
              comboboxValueList={allParentCategories.map((category) => ({
                id: category.categoryId,
                display: buildNameRecursively(category),
              }))}
              onValueChange={(value) => setSelectedParentId(value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy bỏ</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={categoryName === "" || selectedParentId === ""}
          >
            Tiếp tục
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
function UpdateCategoryForm({ allCategories, handleUpdateCategory }) {
  const [categoryName, setCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const allSelectedCategories = useMemo(() => {
    return allCategories.filter(
      (category) => category.categoryName !== "Không xác định"
    );
  }, [allCategories]);
  const allParentCategories = useMemo(() => {
    let newList = [...allCategories];
    (newList = newList.filter(
      (category) =>
        category.categoryId !== selectedCategoryId &&
        category.categoryName !== "Không xác định"
    )),
      newList.push({ categoryName: "Không", categoryId: "!" });
    return newList;
  }, [allCategories, selectedCategoryId]);
  useEffect(() => {
    if (selectedCategoryId === "") {
      setCategoryName("");
      return;
    }
    setCategoryName(
      allSelectedCategories.find(
        (category) => category.categoryId === selectedCategoryId
      ).categoryName
    );
  }, [selectedCategoryId]);
  function buildNameRecursively(category, allCategories) {
    if (!allCategories) {
      return;
    }
    if (!category.parentId) {
      return category.categoryName;
    }
    const parent = allCategories.find(
      (element) => element.categoryId === category.parentId
    );
    if (!parent) {
      return category.categoryName;
    }
    return (
      buildNameRecursively(parent, allCategories) +
      " > " +
      category.categoryName
    );
  }

  return (
    <DialogContent className="">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateCategory(selectedCategoryId, {
            categoryName: categoryName,
            parentId: selectedParentId,
          });
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật ngành hàng</DialogTitle>
          <DialogDescription>Cập nhật ngành hàng</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label>Chọn ngành hàng</Label>
            <ComboBoxWithSearch
              textPlaceholder="Chọn ngành hàng cần cập nhật"
              optionPlaceHolder="Tìm kiếm ngành hàng"
              comboboxValue={selectedCategoryId}
              comboboxValueList={allSelectedCategories.map((category) => ({
                id: category.categoryId,
                display: buildNameRecursively(category, allSelectedCategories),
              }))}
              onValueChange={(value) => {
                const matchedCategory = allCategories.find(
                  (category) => category.categoryId === value
                );
                console.log("M: ", matchedCategory);
                if (!matchedCategory) {
                  setSelectedParentId("");
                } else if (!matchedCategory.parentId) {
                  setSelectedParentId("!");
                } else {
                  const parent =
                    allCategories.find(
                      (category) =>
                        category.categoryId === matchedCategory.parentId
                    ) || "!";
                  setSelectedParentId(parent.categoryId);
                }
                setSelectedCategoryId(value);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label>Tên ngành hàng mới</Label>
              <Input
                disabled={selectedCategoryId === ""}
                placeholder="Nhập tên ngành hàng mới"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label>Ngành hàng cha</Label>
              <ComboBoxWithSearch
                textPlaceholder="Chọn ngành hàng cha"
                optionPlaceHolder="Tìm kiếm ngành hàng cha"
                disabled={selectedCategoryId === ""}
                comboboxValue={selectedParentId}
                comboboxValueList={allParentCategories.map((category) => ({
                  id: category.categoryId,
                  display: buildNameRecursively(category, allParentCategories),
                }))}
                onValueChange={(value) => setSelectedParentId(value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy bỏ</Button>
          </DialogClose>
          <Button type="submit" disabled={selectedCategoryId === ""}>
            Tiếp tục
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
function DeleteCategoryForm({ allCategories, handleDeleteCategory }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const allViewableCategory = useMemo(() => {
    return allCategories.filter(
      (category) => category.categoryName !== "Không xác định"
    );
  }, [allCategories]);
  const allDeletableCategory = useMemo(() => {
    const newList = allCategories.filter(
      (category) => category.categoryName !== "Không xác định"
    );
    const allParentId = newList.map((category) => category.parentId);
    const leaf = newList.filter(
      (category) => !allParentId.includes(category.categoryId)
    );
    return leaf;
  }, [allCategories]);

  function buildNameRecursively(category) {
    if (!category.parentId) {
      return category.categoryName;
    }
    const parent = allViewableCategory.find(
      (element) => element.categoryId === category.parentId
    );
    if (!parent) {
      return category.categoryName;
    }
    return buildNameRecursively(parent) + " > " + category.categoryName;
  }

  return (
    <DialogContent className="">
      <DialogHeader>
        <DialogTitle>Xóa ngành hàng</DialogTitle>
        <DialogDescription>
          Bạn chỉ có thể xóa các ngành hàng lá
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <Label>Ngành hàng cần xóa</Label>
        <ComboBoxWithSearch
          textPlaceholder="Chọn ngành hàng cần xóa"
          optionPlaceHolder="Tìm kiếm ngành hàng"
          comboboxValue={selectedCategoryId}
          comboboxValueList={allDeletableCategory.map((category) => ({
            id: category.categoryId,
            display: buildNameRecursively(category),
          }))}
          onValueChange={(value) => setSelectedCategoryId(value)}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Hủy bỏ</Button>
        </DialogClose>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={selectedCategoryId === ""}>Tiếp tục</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Bạn có chắc chắn muốn xóa ngành hàng này?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này là không thể khôi phục. Hệ thống sẽ tự động chuyển
                các sản phẩm thuộc ngành hàng này về không xác định
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDeleteCategory(selectedCategoryId);
                  setSelectedCategoryId("");
                }}
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  );
}

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[12px] pt-[20px] gap-[20px] rounded-[4px] bg-[white] w-full h-screen",
};
