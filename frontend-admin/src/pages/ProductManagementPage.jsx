import { productApi } from "@/api/productApi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InputWithStartAddOn } from "@/reuseables/Input";
import { SelectWithStartAddOn } from "@/reuseables/Select";
import { formatMoney } from "@/utils";
import {
  ArchiveIcon,
  ArchiveRestore,
  ChevronUpIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const reusableStyle = {
  block:
    "flex flex-col p-[12px] pt-[12px] gap-2 rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  summaryBlock: "flex flex-col gap-6 w-full bg-blue-50 rounded-[4px] p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};

const itemLimit = 1000;
const currentItem = 50;
const tableSelectionList = [
  { name: "Tất cả( được đăng bán)" },
  { name: "Đang hoạt động" },
  { name: "Đã tạm ngưng" },
  { name: "Đã xóa" },
  { name: "Bản nháp" },
];
export default function ProductManagementPage() {
  return (
    <div className="page-layout">
      <h1>Quản lý sản phẩm</h1>
      <div className="flex flex-col gap-[20px]">
        {" "}
        <Collapsible className={reusableStyle.block}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className={"w-full justify-between"}>
              <h2>Tổng quan sản phẩm</h2>
              <ChevronUpIcon className="[[data-state=closed]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SummaryBlock
              itemLimit={1000}
              currentItem={20}
              currentItemInStorage={20}
            />
          </CollapsibleContent>
        </Collapsible>
        <TableWrapper />
      </div>
    </div>
  );
}
function SummaryBlock({ itemLimit, currentItem, currentItemInStorage }) {
  return (
    <div className="grid grid-cols-3 gap-6 pl-2 pr-2">
      <div className={reusableStyle.summaryBlock}>
        <h3>Giới hạn sản phẩm</h3>
        <div className="flex w-full items-center gap-4">
          <Progress value={currentItem / itemLimit} />
          <span>{`${currentItem}/${itemLimit}`}</span>
        </div>
      </div>
      <div className={reusableStyle.summaryBlock}>
        <h3>Tổng hàng tồn kho</h3>
        <div className="flex w-full items-center gap-4">
          <h1>56</h1>
        </div>
      </div>
      <div className={reusableStyle.summaryBlock}>
        <h3>Thông số khác</h3>
        <div className="flex w-full items-center gap-4">
          <h3>{currentItemInStorage}</h3>
        </div>
      </div>
    </div>
  );
}
function TableWrapper({}) {
  const [currentTableSelection, setCurrentTableSelection] = useState(1);
  const [filter, setFilter] = useState({
    productName: "",
    productCategory: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const sortByValueList = ["newest", "oldest", "alphabetical"];

  return (
    <div className="flex flex-col gap-[20px]">
      <TableSelectionTab
        currentFilterTab={currentTableSelection}
        setCurrentFilterTab={setCurrentTableSelection}
        tableSelectionList={tableSelectionList}
      />
      <TableFilterAndSort
        currentTableSelection={currentTableSelection}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortByValueList={sortByValueList}
      />
      <TableView currentTableSelection={currentTableSelection} />
    </div>
  );
}
function TableSelectionTab({
  currentFilterTab,
  setCurrentFilterTab,
  tableSelectionList,
}) {
  return (
    <div className={reusableStyle.block}>
      <div className="flex gap-2">
        {tableSelectionList.map((tab, index) => (
          <Button
            key={tab.name}
            className={
              "rounded-none " + (currentFilterTab === index && "border-b")
            }
            variant={"ghost"}
            onClick={(e) => setCurrentFilterTab(index)}
          >
            <h3>{tab.name}</h3>
          </Button>
        ))}
      </div>
    </div>
  );
}
function TableFilterAndSort({
  currentTableSelection,
  filter,
  setFilter,
  sortBy,
  sortByValueList,
  setSortBy,
}) {
  return (
    <div className={`pt-[20px] pb-[20px] gap-4 ` + reusableStyle.block}>
      <h3>Lọc và sắp xếp sản phẩm</h3>
      <div className="grid grid-cols-3 gap-4">
        <InputWithStartAddOn
          addOnlabel={"Tên sản phẩm"}
          placeholder={"Nhập tên sản phẩm"}
          value={filter.productName}
          onInputValueChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              productName: e.target.value,
            }))
          }
        />
        {currentTableSelection === 1 && (
          <InputWithStartAddOn
            addOnlabel={"Ngành hàng"}
            value={filter.productCategory}
            onInputValueChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                productCategory: e.target.value,
              }))
            }
          />
        )}
        <SelectWithStartAddOn
          addOnlabel={"Sắp xếp"}
          selectValue={sortBy}
          onSelectValueChange={(value) => setSortBy(value)}
          selectValueList={sortByValueList}
          placeholder={"Chọn cách sắp xếp"}
        />
      </div>
    </div>
  );
}
function TableView({ currentTableSelection, filter, sortBy }) {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [productList, setProductList] = useState([]);
  const getAllProducts = async () => {
    try {
      const response = await productApi.getAllProduct();
      setProductList(response.data.data);
    } catch (error) {
      toast.error("Có lỗi khi lấy danh sách sản phẩm");
    }
  };
  useEffect(() => {
    getAllProducts();
  }, []);

  const updateProductPublished = async (productId, checked) => {
    try {
      const response = await productApi.updateProductPublished(
        productId,
        checked
      );
      setProductList(response.data);
      toast.success("Cập nhật dữ liệu sản phẩm thành công");
    } catch (error) {
      toast.error("Có lỗi khi cập nhật dữ liệu sản phẩm");
    }
  };
  const deleteProduct = async (productId) => {
    try {
      const response = await productApi.deleteProduct(productId);
      setProductList(response.data);
      toast.success("Xóa sản phẩm thành công");
    } catch (error) {
      toast.error("Có lỗi khi xóa sản phẩm");
    }
  };
  const restoreProduct = async (productId) => {
    try {
      const response = await productApi.restoreProduct(productId);
      setProductList(response.data);
      toast.success("Khôi phục sản phẩm thành công");
    } catch (error) {
      toast.error("Có lỗi khi khôi phục sản phẩm");
    }
  };
  const filteredProductList = useMemo(() => {
    if (currentTableSelection === 0) {
      return productList.filter(
        (product) => !product.isDeleted && !product.isDrafted
      );
    }
    if (currentTableSelection === 1) {
      return productList.filter(
        (product) =>
          product.isPublished && !product.isDeleted && !product.isDrafted
      );
    }
    if (currentTableSelection === 2) {
      return productList.filter(
        (product) =>
          !product.isPublished && !product.isDeleted && !product.isDrafted
      );
    }
    if (currentTableSelection === 3) {
      return productList.filter((product) => product.isDeleted);
    }
    if (currentTableSelection === 4) {
      return productList.filter(
        (product) => product.isDrafted && !product.isDeleted
      );
    }
  }, [currentTableSelection, productList]);
  const tableType = useMemo(() => {
    if (currentTableSelection > 2) {
      return 2;
    }
    return 1;
  }, [currentTableSelection]);
  if (filteredProductList.length === 0)
    return <h2 className="text-center mt-10">Không có sản phẩm phù hợp</h2>;

  return (
    <div className={`w-full ` + reusableStyle.block}>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center ">
          <span className="text-muted-foreground">Đã chọn 0 sản phẩm</span>
          <Button variant={"outline"} disabled>
            Dừng hoạt động
          </Button>
          <Button variant={"outline"} disabled>
            Xóa
          </Button>
          <Button disabled> Xuất dữ liệu</Button>
        </div>
        <Button> Thêm sản phẩm mới</Button>
      </div>
      <div className="[&>div]:rounded-sm [&>div]:border">
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Danh sách sản phẩm
        </p>
        {tableType === 1 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  <Checkbox aria-label="select-all" />
                </TableHead>
                <TableHead className="w-60">Thông tin sản phẩm</TableHead>
                <TableHead className="w-45">Ngành hàng</TableHead>
                <TableHead className="w-45">Giá bán</TableHead>
                <TableHead className="w-45">Tổng tồn kho</TableHead>
                <TableHead className="w-40">Hoạt động</TableHead>
                <TableHead className="w-30">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductList.map((product) => (
                <TableRow
                  key={product.productId}
                  className="has-data-[state=checked]:bg-muted/50 !border-none"
                >
                  <TableCell>
                    <Checkbox
                      productId={`table-checkbox-${product.productId}`}
                      aria-label={`product-checkbox-${product.productId}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="rounded-sm">
                        <AvatarImage
                          src={product.thumbnailURL}
                          alt={product.thumbnailURL}
                        />
                        <AvatarFallback className="text-xs"></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>{`${formatMoney(
                    product.sellingPriceBot
                  )} - ${formatMoney(product.sellingPriceTop)}`}</TableCell>
                  <TableCell>{product.inStorageTotal}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isPublished}
                      onCheckedChange={(checked) => {
                        updateProductPublished(product.productId, checked);
                      }}
                    />
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label={`product-${product.productId}-edit`}
                      onClick={() => {
                        navigate(`/edit-product/${product.productId}`);
                      }}
                    >
                      <PencilIcon />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`product-${product.productId}-remove`}
                        >
                          <Trash2Icon />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa sản phẩm này?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Thao tác này sẽ chuyển sản phẩm về trạng thái bị ẩn.
                            Người dùng sẽ không thấy sản phẩm này
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteProduct(product.productId);
                            }}
                          >
                            Xác nhận
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  <Checkbox aria-label="select-all" />
                </TableHead>
                <TableHead className={"w-60"}>Thông tin sản phẩm</TableHead>
                <TableHead>Chú thích</TableHead>
                <TableHead className="min-w-30">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductList.map((product) => (
                <TableRow
                  key={product.productId}
                  className="has-data-[state=checked]:bg-muted/50 !border-none"
                >
                  <TableCell>
                    <Checkbox
                      productId={`table-checkbox-${product.productId}`}
                      aria-label={`product-checkbox-${product.productId}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="rounded-sm">
                        <AvatarImage
                          src={product.thumbnailURL}
                          alt={product.thumbnailURL}
                        />
                        <AvatarFallback className="text-xs"></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <span className="text-muted-foreground mt-0.5 text-xs">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="px-4 bg-green-50 text-wrap pt-2 pb-2 rouned-sm">
                      Khách hàng sẽ không thấy những sản phẩm tại đây. Bản nháp/
                      bản đã xóa sẽ bị xóa sau 90 ngày không thao tác
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    {currentTableSelection !== 3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`product-${product.productId}-edit`}
                        onClick={() => {
                          navigate(`/edit-product/${product.productId}`);
                        }}
                      >
                        <PencilIcon />
                      </Button>
                    )}

                    {currentTableSelection === 3 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            aria-label={`product-${product.productId}-restore`}
                          >
                            <ArchiveRestore />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Bạn có chắc chắn muốn khôi phục bản ghi này
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Thao tác này sẽ chuyển bản ghi về lại trạng thái
                              ban đầu
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                restoreProduct(product.productId);
                              }}
                            >
                              Xác nhận
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
                          aria-label={`product-${product.productId}-remove`}
                        >
                          <Trash2Icon />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa bản ghi này?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Thao tác này là không thể khôi phục!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              // deleteProduct(product.productId);
                            }}
                          >
                            Xác nhận
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
