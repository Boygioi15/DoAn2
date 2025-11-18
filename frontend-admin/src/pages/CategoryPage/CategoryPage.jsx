import categoryApi from "@/api/categoryApi";
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
import ComboBoxWithSearch from "@/reuseables/ComboboxWithSearch";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Edit,
  FilePlusCorner,
  FileXCorner,
  Plus,
  Search,
  Trash,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
const reusableStyle = {
  inputBlock:
    "flex flex-col p-[12px] pt-[20px] gap-[20px] rounded-[4px] bg-[white] w-full h-auto",
};
export default function CategoryPage() {
  const [allCategory, setAllCategory] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const getAllCategory = async () => {
    try {
      const response = await categoryApi.getAllCategory();
      setAllCategory(response.data);
    } catch (error) {
      toast.error("Có lỗi khi lấy dữ liệu ngành hàng");
    }
  };
  useEffect(() => {
    getAllCategory();
  }, []);
  const buildCategoryTree = () => {
    if (!allCategory) {
      return;
    }
    function BuildRecursiveChildren(allCategory, currentCategory) {
      const allChildren = allCategory.filter(
        (category) => category.parentId === currentCategory._id
      );
      // console.log("CP: ", currentCategory);
      // console.log("CC: ", allChildren);
      if (allChildren.length === 0) {
        return;
      }

      currentCategory.children = allChildren;
      currentCategory.children.forEach((children) =>
        BuildRecursiveChildren(allCategory, children)
      );
    }
    const cleanedData = allCategory.map((category) => ({
      name: category.categoryName,
      _id: category.categoryId,
      id: category.categoryId,
      parentId: category.parentId,
    }));
    //first tier
    const categoryTree = cleanedData.filter((category) => !category.parentId);
    categoryTree.map((children) =>
      BuildRecursiveChildren(cleanedData, children)
    );
    return categoryTree;
  };

  const categoryTree = useMemo(() => {
    const result = buildCategoryTree();
    return result;
  }, [allCategory]);
  // console.log("C:", categoryTree);

  async function handleCreateCategory(categoryData) {
    if (categoryData.parentId === "!") categoryData.parentId = null;
    const data = {
      categoryName: categoryData.categoryName,
      parentId: categoryData.parentId,
    };
    try {
      const response = await categoryApi.createNewCategory(data);
      setAllCategory(response.data);
      toast.success("Tạo mới ngành hàng thành công");
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error("Có lỗi khi tạo mới ngành hàng");
    }
  }
  async function handleUpdateCategory(categoryId, categoryData) {
    console.log("I:", categoryId);
    console.log("D:", categoryData);
    if (categoryData.parentId === "!") {
      categoryData.parentId = null;
    }
    const data = {
      categoryName: categoryData.categoryName,
      parentId: categoryData.parentId,
    };
    try {
      const response = await categoryApi.updateCategory(categoryId, data);
      setAllCategory(response.data);
      setIsUpdateDialogOpen(false);
      toast.success("Cập nhật ngành hàng thành công");
    } catch (error) {
      toast.error("Có lỗi khi cập nhật ngành hàng");
    }
  }
  async function handleDeleteCategory(categoryId) {
    try {
      const response = await categoryApi.deleteCategory(categoryId);
      setAllCategory(response.data);
      setIsDeleteDialogOpen(false);
      toast.success("Xóa ngành hàng thành công");
    } catch (error) {
      toast.error("Có lỗi khi xóa ngành hàng");
    }
  }
  return (
    <div className="page-layout">
      <h1>Quản lý ngành hàng</h1>
      {categoryTree && (
        <div className="grid grid-cols-[30%_70%] gap-4">
          <div className={reusableStyle.inputBlock}>
            <h2>Danh sách ngành hàng</h2>
            <div className="flex gap-2">
              <div className="relative grow">
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                  <Search className="size-4" />
                  <span className="sr-only">Search</span>
                </div>
                <Input
                  type="text"
                  placeholder="Tìm kiếm ngành hàng"
                  className="peer pl-9"
                />
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                }}
              >
                <DialogTrigger onClick={() => setIsCreateDialogOpen(true)}>
                  <Button variant={"outline"}>
                    <Plus />
                  </Button>
                </DialogTrigger>
                <CreateNewCategoryForm
                  allCategories={allCategory}
                  handleAddCategory={handleCreateCategory}
                />
              </Dialog>

              <Dialog
                open={isUpdateDialogOpen}
                onOpenChange={(open) => {
                  setIsUpdateDialogOpen(open);
                }}
              >
                <DialogTrigger onClick={() => setIsUpdateDialogOpen(true)}>
                  <Button variant={"outline"}>
                    <Edit />
                  </Button>
                </DialogTrigger>
                <UpdateCategoryForm
                  allCategories={allCategory}
                  handleUpdateCategory={handleUpdateCategory}
                />
              </Dialog>

              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                  setIsDeleteDialogOpen(open);
                }}
              >
                <DialogTrigger onClick={() => setIsDeleteDialogOpen(true)}>
                  <Button variant={"outline"}>
                    <Trash />
                  </Button>
                </DialogTrigger>
                <DeleteCategoryForm
                  allCategories={allCategory}
                  handleDeleteCategory={handleDeleteCategory}
                />
              </Dialog>
            </div>
            <div className="border border-border h-[600px] rounded-sm bg-gray-50">
              <TreeView data={categoryTree} expandAll />
            </div>
          </div>

          <div className={reusableStyle.inputBlock}>
            <h2>Các sản phẩm đi kèm</h2>
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
