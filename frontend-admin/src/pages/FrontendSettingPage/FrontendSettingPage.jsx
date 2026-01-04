import frontendSettingApi from "@/api/frontendSettingApi";
import CoverUpload from "@/components/cover-upload";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { set } from "date-fns";
import { ChevronDown, RefreshCcw, Trash2Icon } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

const imageDefault = {
  url: "",
  relativePath: "",
};
export default function FrontendSettingPage() {
  const [initalData, setInitialData] = useState(null);
  const [announcementBar, setAnnoucementBar] = useState(null);
  const [announcementCarousel, setAnnouncementCarousel] = useState([]);
  const [heroCarousel, setHeroCarousel] = useState([]);
  const [categoryPageSetting, setCategoryPageSetting] = useState({});
  const getAllSetting = async () => {
    try {
      const response = await frontendSettingApi.getAllFrontendSetting();
      console.log(response.data.categoryIdNameMap);
      setInitialData(response.data);
      setAnnoucementBar(response.data["announcementBar"] || null);
      setAnnouncementCarousel(response.data["announcementCarousel"] || []);
      setHeroCarousel(response.data["heroCarousel"] || []);
      setCategoryPageSetting(response.data["categoryPageSetting"] || {});
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi lấy dữ liệu cài đặt giao diện");
    }
  };
  const handleUpdateSetting = async (setting, content) => {
    try {
      const response = await frontendSettingApi.updateFrontendSetting(
        setting,
        content
      );
      toast.success("Cập nhật cài đặt giao diện thành công");
      await getAllSetting();
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi khi cập nhật cài đặt giao diện");
    }
  };
  const handleRestoreSetting = async (setting) => {
    if (setting === "announcement-bar") {
      setAnnoucementBar(
        initalData ? initalData["announcementBar"] || null : null
      );
    }
    if (setting === "announcement-carousel") {
      setAnnouncementCarousel(
        initalData ? initalData["announcementCarousel"] || [] : []
      );
    }
    if (setting === "hero-carousel") {
      setHeroCarousel(initalData ? initalData["heroCarousel"] || [] : []);
    }
    if (setting === "category-page-setting") {
      setCategoryPageSetting(
        initalData ? initalData["categoryPageSetting"] || {} : {}
      );
    }
  };
  useEffect(() => {
    getAllSetting();
  }, []);
  useEffect(() => {
    if (!initalData) return;
    console.log(initalData.categoryIdNameMap);
  }, [initalData]);
  return (
    <div className="page-layout">
      <Collapsible className="bg-white rounded-lg" defaultOpen>
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className={
              "flex justify-between w-full  px-2 h-12 hover:bg-white/90"
            }
          >
            <h3>Annoucement bar</h3>
            <ChevronDown />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {announcementBar && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[70px_1fr_1fr_40px] gap-4 px-3 py-3">
                <Label>Hình 1:</Label>
                <div className="group relative w-full">
                  <Label className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs">
                    URL hình
                  </Label>
                  <Input
                    placeholder="Nhập URL hình"
                    className="dark:bg-background h-10"
                    value={announcementBar.url}
                    onChange={(e) => {
                      setAnnoucementBar((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }));
                    }}
                  />
                </div>
                <div className="group relative w-full">
                  <Label className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs">
                    Đường dẫn tương đối
                  </Label>
                  <Input
                    placeholder="Nhập đường dẫn tương đối"
                    className="dark:bg-background h-10"
                    value={announcementBar.relativePath}
                    onChange={(e) => {
                      setAnnoucementBar((prev) => ({
                        ...prev,
                        relativePath: e.target.value,
                      }));
                    }}
                  />
                </div>
                <Button
                  onClick={() => {
                    setAnnoucementBar(null);
                  }}
                  variant={"destructive"}
                  className={"h-full"}
                >
                  <Trash2Icon />
                </Button>
              </div>
              {announcementBar.url.trim().length > 0 && (
                <div className="px-3 space-y-1">
                  <Label>Hình minh họa</Label>
                  <img src={announcementBar.url} />
                </div>
              )}
            </div>
          )}
          {!announcementBar && (
            <div className={"px-3 py-3 w-full"}>
              <Button
                variant="outline"
                onClick={() => {
                  setAnnoucementBar(imageDefault);
                }}
                className={"w-full"}
              >
                Đặt hình mới
              </Button>
            </div>
          )}
          <div className="px-3 py-3 items-center justify-end flex gap-2">
            <Button
              variant={"outline"}
              onClick={() => handleRestoreSetting("announcement-bar")}
            >
              Khôi phục
            </Button>
            <Button
              onClick={() =>
                handleUpdateSetting("announcement-bar", announcementBar)
              }
            >
              Lưu thay đổi
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* announcement carousel */}
      <Collapsible className="bg-white rounded-lg" defaultOpen>
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className={
              "flex justify-between w-full  px-2 h-12 hover:bg-white/90"
            }
          >
            <h3>Annoucement carousel</h3>
            <ChevronDown />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4 p-3">
              {announcementCarousel.map((announcement, index) => (
                <div className="grid grid-cols-[120px_1fr_40px] gap-2">
                  <Label>Annoucement {index + 1}:</Label>
                  <Input
                    placeholder="Nhập prompt"
                    value={announcement}
                    onChange={(e) => {
                      const newList = [...announcementCarousel];
                      newList[index] = e.target.value;
                      setAnnouncementCarousel(newList);
                    }}
                  />
                  <Button
                    onClick={() => {
                      setAnnouncementCarousel((prev) => {
                        const newList = [...prev];
                        newList.splice(index, 1);
                        return newList;
                      });
                    }}
                    variant={"destructive"}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setAnnouncementCarousel((prev) => [...prev, ""]);
                }}
              >
                Thêm announcement mới
              </Button>
            </div>
            <div className="px-3 py-3 items-center justify-end flex gap-2">
              <Button
                variant={"outline"}
                onClick={() => handleRestoreSetting("announcement-carousel")}
              >
                Khôi phục
              </Button>
              <Button
                onClick={() =>
                  handleUpdateSetting(
                    "announcement-carousel",
                    announcementCarousel
                  )
                }
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="bg-white rounded-lg" defaultOpen>
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className={
              "flex justify-between w-full  px-2 h-12 hover:bg-white/90"
            }
          >
            <h3>Hero carousel</h3>
            <ChevronDown />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2">
            {heroCarousel.map((banner, index) => (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[70px_1fr_1fr_40px] gap-4 px-3 py-3">
                  <Label>Hình {index + 1}:</Label>
                  <div className="group relative w-full">
                    <Label className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs">
                      URL hình
                    </Label>
                    <Input
                      placeholder="Nhập URL hình"
                      className="dark:bg-background h-10"
                      value={banner.url}
                      onChange={(e) => {
                        const newList = [...heroCarousel];
                        newList[index] = {
                          ...newList[index],
                          url: e.target.value,
                        };
                        setHeroCarousel(newList);
                      }}
                    />
                  </div>
                  <div className="group relative w-full">
                    <Label className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs">
                      Đường dẫn tương đối
                    </Label>
                    <Input
                      placeholder="Nhập đường dẫn tương đối"
                      className="dark:bg-background h-10"
                      value={banner.relativePath}
                      onChange={(e) => {
                        const newList = [...heroCarousel];
                        newList[index] = {
                          ...newList[index],
                          relativePath: e.target.value,
                        };
                        setHeroCarousel(newList);
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setHeroCarousel((prev) => {
                        const newList = [...prev];
                        newList.splice(index, 1);
                        return newList;
                      });
                    }}
                    variant={"destructive"}
                    className={"h-full"}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
                {banner.url.trim().length > 0 && (
                  <div className="px-3 space-y-1">
                    <Label>Hình minh họa</Label>
                    <img src={banner.url} />
                  </div>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setHeroCarousel((prev) => [...prev, imageDefault]);
              }}
              className={"mx-3 my-3"}
            >
              Thêm hình mới
            </Button>
          </div>
          <div className="px-3 py-3 items-center justify-end flex gap-2">
            <Button
              variant={"outline"}
              onClick={() => handleRestoreSetting("hero-carousel")}
            >
              Khôi phục
            </Button>
            <Button
              onClick={() => handleUpdateSetting("hero-carousel", heroCarousel)}
            >
              Lưu thay đổi
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible className="bg-white rounded-lg" defaultOpen>
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className={
              "flex justify-between w-full  px-2 h-12 hover:bg-white/90"
            }
          >
            <h3>Ảnh danh mục cấp 1</h3>
            <ChevronDown />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 px-3 py-3">
            {Object.entries(categoryPageSetting).map(([categoryId, value]) => (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[150px_450px]">
                  <Label>
                    Danh mục - {initalData.categoryIdNameMap[categoryId]}:
                  </Label>
                  <div className="group relative w-full">
                    <Label className="bg-background text-foreground absolute top-0 left-2 z-1 block -translate-y-1/2 px-1 text-xs">
                      URL hình
                    </Label>
                    <Input
                      placeholder="Nhập URL hình"
                      className="dark:bg-background h-10"
                      value={value}
                      onChange={(e) => {
                        const newSetting = { ...categoryPageSetting };
                        newSetting[categoryId] = e.target.value;
                        setCategoryPageSetting(newSetting);
                      }}
                    />
                  </div>
                </div>
                {value.trim().length > 0 && (
                  <div className="space-y-1">
                    <Label>Hình minh họa</Label>
                    <img src={value} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-3 py-3 items-center justify-end flex gap-2">
            <Button
              variant={"outline"}
              onClick={() => handleRestoreSetting("category-page-setting")}
            >
              Khôi phục
            </Button>
            <Button
              onClick={() =>
                handleUpdateSetting(
                  "category-page-setting",
                  categoryPageSetting
                )
              }
            >
              Lưu thay đổi
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
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
