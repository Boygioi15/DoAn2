import categoryApi from "@/api/categoryApi";
import { productApi } from "@/api/productApi";
import FileUploadCompact from "@/components/compact-upload";
import {
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialog,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { slugifyOption } from "@/constants";
import ComboBoxWithSearch from "@/reusable-component/ComboboxWithSearch";
import { InputBlock_Input } from "@/reusable-component/Input";
import UploadComponent from "@/reusable-component/UploadComponent";
import { buildCategoryNameRecursively } from "@/utils";
import { Menu, Trash, Trash2Icon } from "lucide-react";
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import slugify from "slugify";
import { toast } from "sonner";
import { v4 } from "uuid";
import BasicInfoBlock from "./components/BasicInfoBlock";
import useEditProduct from "@/hooks/useEditProduct";
import DescriptionBlock from "./components/DescriptionBlock";
import PropertyBlock from "./components/PropertyBlock";
import VariantDetailBlock from "./components/VariantDetailBlock";
import SizeBlock from "./components/SizeBlock";
import VariantListBlock from "./components/VariantBlock";
import { Spinner } from "@/components/ui/spinner";

export const EditProductPageContext = createContext();
export default function EditProductPage() {
  const addProductHook = useEditProduct();

  //tracker
  const basicInfoRef = useRef(null);
  const propertiesRef = useRef(null);
  const descriptionRef = useRef(null);
  const variantsRef = useRef(null);
  const sizeRef = useRef(null);
  const variantDetailRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const sections = [
      basicInfoRef.current,
      descriptionRef.current,
      propertiesRef.current,
      variantsRef.current,
      sizeRef.current,
      variantDetailRef.current,
    ];

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      if (!visible.length) return;

      const winner = visible.reduce((a, b) =>
        a.boundingClientRect.top < b.boundingClientRect.top ? a : b
      );

      const index = sections.indexOf(winner.target);
      if (index !== -1) setCurrentStep(index + 1);
    });

    sections.forEach((sec) => sec && observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  //tip
  const [tipState, setTipState] = useState(0);

  return (
    <EditProductPageContext.Provider value={addProductHook}>
      <div className="page-layout">
        {/* Big layout!*/}
        {/*Content*/}
        <div className="grid grid-cols-[75%_25%] gap-4">
          <div className="flex flex-col gap-6">
            <div ref={basicInfoRef} onClick={() => setTipState(1)}>
              <BasicInfoBlock />
            </div>
            <div ref={descriptionRef} onClick={() => setTipState(2)}>
              <DescriptionBlock />
            </div>
            <div ref={propertiesRef} onClick={() => setTipState(3)}>
              <PropertyBlock />
            </div>
            <div ref={variantsRef} onClick={() => setTipState(4)}>
              <VariantListBlock />
            </div>
            <div ref={sizeRef} onClick={() => setTipState(5)}>
              <SizeBlock />
            </div>
            <div ref={variantDetailRef} onClick={() => setTipState(6)}>
              <VariantDetailBlock />
            </div>
            {/* EDIT FIELD */}
            <div
              className={`${reusableStyle.inputBlock} flex flex-row justify-between  sticky bottom-0 bg-gray-50 shadow-3xl! -ml-1`}
            >
              <div>
                {!addProductHook.edit && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={addProductHook.handleLoadSampleData}
                    >
                      Load giá trị mẫu
                    </Button>
                    <Button
                      variant="outline"
                      onClick={addProductHook.handleRefreshData}
                    >
                      Làm mới trang
                    </Button>
                  </div>
                )}
              </div>
              {!addProductHook.edit && (
                <div className="flex flex-row gap-2">
                  <Button
                    variant={"outline"}
                    className={
                      "border-blue-500" +
                      (addProductHook.isSubmitLoading &&
                        "opacity-50 pointer-events-none")
                    }
                    onClick={addProductHook.handleCreateNewDraft}
                  >
                    {addProductHook.isSubmitLoading && <Spinner />}
                    Lưu bản nháp
                  </Button>

                  <Button
                    id={"submit-button"}
                    className={
                      addProductHook.isSubmitLoading &&
                      "opacity-50 pointer-events-none"
                    }
                    onClick={addProductHook.handlePublishNewProduct}
                  >
                    {addProductHook.isSubmitLoading && <Spinner />}
                    Xuất bản sản phẩm
                  </Button>
                </div>
              )}
              {addProductHook.edit &&
                addProductHook.initialProductData &&
                addProductHook.initialProductData.isDrafted && (
                  <div className="flex flex-row gap-2">
                    <Button
                      variant={"outline"}
                      className={
                        "border-blue-500" +
                        (addProductHook.isSubmitLoading &&
                          "opacity-50 pointer-events-none")
                      }
                      onClick={addProductHook.handleUpdateDraft}
                    >
                      {addProductHook.isSubmitLoading && <Spinner />}
                      Lưu bản nháp
                    </Button>

                    <Button
                      id={"submit-button"}
                      onClick={addProductHook.handlePublishDraft}
                      className={
                        addProductHook.isSubmitLoading &&
                        "opacity-50 pointer-events-none"
                      }
                    >
                      {addProductHook.isSubmitLoading && <Spinner />}
                      Xuất bản bản nháp
                    </Button>
                  </div>
                )}
              {addProductHook.edit &&
                addProductHook.initialProductData &&
                !addProductHook.initialProductData.isDrafted && (
                  <div className="flex flex-row gap-2">
                    <Button
                      id={"submit-button"}
                      onClick={addProductHook.handleUpdateProduct}
                    >
                      {addProductHook.isSubmitLoading && <Spinner />}
                      Cập nhật sản phẩm
                    </Button>
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-6 sticky top-5 h-fit">
            <ProgressTracker
              currentStep={currentStep}
              refTable={[
                basicInfoRef,
                descriptionRef,
                propertiesRef,
                variantsRef,
                sizeRef,
                variantDetailRef,
              ]}
              isEditing={addProductHook.isEditing}
            />
            <TipBlock state={tipState} />
            <ErrorBlock hasError={addProductHook.hasError} />
          </div>
        </div>
      </div>
    </EditProductPageContext.Provider>
  );
}
const steps = [
  "Thông tin cơ bản",
  "Mô tả sản phẩm",
  "Thuộc tính sản phẩm",
  "Biến thể sản phẩm",
  "Bảng kích thước",
  "Chi tiết biến thể",
];

const ProgressTracker = ({ currentStep, isEditing, refTable }) => {
  return (
    <div
      className={`flex flex-col w-full gap-1! h-fit ${reusableStyle.inputBlock}`}
    >
      <h2 className="text-blue-500">
        Tiến độ - {!isEditing ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
      </h2>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <div
            key={step}
            className="flex flex-row items-center gap-1 pl-2 py-2 cursor-pointer hover:bg-gray-100"
            onClick={() => {
              console.log("HO");
              const ref = refTable[index];
              if (ref?.current) {
                ref.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }}
          >
            <div
              className={
                "w-8 h-8 flex items-center justify-center rounded-full border " +
                (isDone
                  ? "bg-blue-500 text-white border-blue-500"
                  : isActive
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground")
              }
            >
              {index + 1}
            </div>
            <span
              className={
                "text-sm " +
                (isDone || isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground")
              }
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
const TipBlock = ({ state }) => {
  let title = "Tips",
    content = "Các tips hữu dụng sẽ xuất hiện ở đây khi bạn làm việc!";
  if (state === 1) {
    title = "Thông tin cơ bản";
    content =
      "Phần Mô tả sản phẩm cung cấp những thông tin hữu ích về sản phẩm để giúp khách hàng quyết định mua sắm";
  } else if (state === 2) {
    title = "Mô tả sản phẩm";
    content =
      "Vui lòng tải lên hình ảnh, điền tên sản phẩm và chọn đúng ngành hàng trước khi đăng tải sản phẩm.";
  } else if (state === 3) {
    title = "Đặc tính sản phẩm";
    content =
      "Đặc tính sản phẩm càng đầy đủ càng tăng khả năng chọn mua của khách hàng tiềm năng. Hãy cung cấp cả đặc tính chính (key attributes) và đặc tính phụ để tăng hiển thị và chốt đơn";
  } else if (state === 4) {
    title = "Biến thể sản phẩm";
    content =
      "Tạo biến thể sản phẩm của bạn, bắt buộc phải có màu sắc và kích cỡ";
  } else if (state === 5) {
    title = "Bảng kích cỡ";
    content =
      "Bảng kích cỡ sẽ giúp khách hàng biết được mình phù hợp với kích cỡ nào, từ đó kích thích việc mua hàng";
  } else if (state === 6) {
    title = "Chi tiết biến thể";
    content =
      "Nhập chi tiết về giá bán, số lượng trong kho và sku cho từng biến thể";
  }
  return (
    <div className={reusableStyle.inputBlock}>
      <h2
        className="text-blue-500"
        style={{ lineHeight: "25px", marginBottom: "-4px" }}
      >
        {title}
      </h2>
      <span
        style={{
          lineHeight: "20px",
          fontWeight: 300,
          fontSize: "14px",
          textAlign: "justify",
          paddingLeft: "8px",
        }}
      >
        {content}
      </span>
    </div>
  );
};
const ErrorBlock = ({ hasError }) => {
  return (
    <div className={reusableStyle.inputBlock}>
      {!hasError ? (
        <h2 style={{ color: "green", lineHeight: "25px" }}>
          Hay quá, bạn đã sửa hết lỗi rồi!
        </h2>
      ) : (
        <h2 style={{ color: "red", lineHeight: "25px" }}>
          OOps, hãy sửa lỗi trước khi publish nhé!
        </h2>
      )}
    </div>
  );
};

const reusableStyle = {
  inputBlock:
    "flex flex-col p-[16px] pt-[20px] gap-[20px] rounded-[8px] bg-[white] w-full h-auto shadow-lg",
  variantBlock: "bg-gray-50 rounded-[4px] flex flex-col gap-6 p-4",
  errorBorder:
    " border border-red-200 drop-shadow-[0_0_8px_rgba(255,0,0,0.05)]",
};
