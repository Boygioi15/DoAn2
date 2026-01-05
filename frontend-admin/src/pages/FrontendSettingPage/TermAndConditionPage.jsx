import frontendSettingApi from "@/api/frontendSettingApi";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import ComboBoxWithSearch from "@/reusable-component/ComboboxWithSearch";
import { SelectWithStartAddOn } from "@/reusable-component/Input";
import MDEditor from "@uiw/react-md-editor";
import { Ban, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const screenList = [
  {
    value: "loyal-customer-condition",
    display: "Điều kiện & Điều khoản KHTT",
  },
  {
    value: "loyal-customer-policy",
    display: "Chính sách KHTT",
  },
  {
    value: "customer-security-policy",
    display: "Chính sách bảo mật thông tin KH",
  },
  {
    value: "delivery-policy",
    display: "Chính sách vận chuyển",
  },
  {
    value: "contact",
    display: "Liên hệ",
  },
  {
    value: "about",
    display: "Giới thiệu",
  },
  {
    value: "general-size-guidance",
    display: "Bảng tham khảo kích cỡ chung",
  },
];
export default function TermAndConditionPage() {
  const [selectedScreen, setSelectedScreen] = useState("");
  const [mode, setMode] = useState("view");
  const [value, setValue] = useState("");
  const [w_value, w_setValue] = useState(value);
  const [isSavingLoading, setIsSavingLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const getNewScreen = async (newSelectedScreen) => {
    if (newSelectedScreen !== "") {
      try {
        const response = await frontendSettingApi.getFrontendPage(
          newSelectedScreen
        );
        w_setValue(response.data);
        setValue(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Có lỗi khi lấy dữ liệu");
      }
    }
  };
  const updateScreen = async () => {
    try {
      setIsSavingLoading(true);
      const response = await frontendSettingApi.updateFrontendPage(
        selectedScreen,
        value
      );
      toast.success("Cập nhật thành công!");
      setMode("view");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi cập nhật");
    } finally {
      setIsSavingLoading(false);
    }
  };
  const rollBackChange = async () => {
    setValue(w_value);
    setMode("view");
  };
  return (
    <div className=" space-y-6 relative pt-5 pb-20">
      <div className={reusableStyle.block + " sticky top-0 z-10"}>
        <div className=" flex justify-between">
          <div className="max-w-200 w-150">
            <SelectWithStartAddOn
              addOnlabel={"Màn hình"}
              placeholder={"Chọn màn hình"}
              selectValue={selectedScreen}
              onSelectValueChange={(value) => {
                setMode("view");
                setSelectedScreen(value);
                getNewScreen(value);
              }}
              selectValueList={screenList}
            />
          </div>
          {selectedScreen !== "" && (
            <div>
              {mode === "view" ? (
                <Button onClick={() => setMode("edit")}>
                  <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" disabled={isSavingLoading}>
                          {isSavingLoading && <Spinner />}
                          <Ban className="mr-2 h-4 w-4" /> Hủy
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn quay lại bản lưu trước?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này là không thể khôi phục được!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={rollBackChange}>
                            Tiếp tục
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className={
                            "bg-blue-600 hover:bg-blue-700 " +
                            (isSavingLoading && " disabled")
                          }
                          disabled={isSavingLoading}
                        >
                          {isSavingLoading && <Spinner />}
                          <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bạn có chắc chắn muốn lưu bản soạn?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này là không thể khôi phục được!
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={updateScreen}>
                            Tiếp tục
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                </div>
              )}
            </div>
          )}
        </div>
        {mode === "view" && selectedScreen !== "" && <Separator />}
        {mode === "view" && selectedScreen !== "" && (
          <span className="text-center">Hiện bạn đang ở chế độ chỉ xem</span>
        )}
      </div>

      {selectedScreen !== "" ? (
        <>
          {" "}
          <div className="grid grid-cols-2 mb-4">
            <span className="text-center text-[20px]">**Markdown**</span>
            <span className="text-center text-[20px] font-bold">Preview</span>
          </div>
          <MDEditor
            value={value}
            onChange={(value) => {
              if (mode === "edit") {
                setValue(value);
              }
            }}
            className={"h-screen! "}
          />
        </>
      ) : (
        <div className="w-full mt-20 text-center text-[20px] font-bold">
          Hãy chọn màn hình để bắt đầu
        </div>
      )}

      {/* <MDEditor.Markdown source={value} style={{ whiteSpace: "pre-wrap" }} /> */}
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
