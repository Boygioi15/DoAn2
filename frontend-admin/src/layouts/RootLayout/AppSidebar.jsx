"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Book,
  Box,
  ChevronDown,
  Dock,
  MonitorCheck,
  MonitorCloud,
  Pencil,
  UserCircle2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const sidebarItems = [
  { title: "Quản lý khách hàng", url: "/user", icon: UserCircle2 },
  {
    group: "Sản phẩm",
    children: [
      { title: "Quản lý sản phẩm", url: "/product-management", icon: Box },
      {
        title: "Quản lý ngành hàng",
        url: "/category-management",
        icon: Box,
      },
      { title: "Thêm sản phẩm mới", url: "/edit-product", icon: Pencil },
    ],
  },
  {
    group: "Đơn hàng",
    children: [
      {
        title: "Quản lý đơn hàng",
        url: "/order-management",
        icon: Dock,
      },
      {
        title: "Tạo đơn trực tiếp",
        url: "/direct-order-create",
        icon: MonitorCheck,
      },
    ],
  },
  {
    group: "Cài đặt giao diện",
    children: [
      {
        title: "Cài đặt giao diện",
        url: "/frontend-setting",
        icon: MonitorCloud,
      },
      {
        title: "Chính sách & Điều khoản",
        url: "/term-and-condition",
        icon: Book,
      },
    ],
  },
];
export default function AppSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  return (
    <Sidebar className="list-none">
      <SidebarContent className="px-4 bg-white  gap-0!">
        <SidebarHeader className="pt-6 mb-4">
          <h1>Trang admin</h1>
        </SidebarHeader>
        {sidebarItems.map((item1, index) =>
          item1.group ? (
            <Collapsible key={index} defaultOpen className="w-full py-2">
              <CollapsibleTrigger
                key={index}
                defaultOpen
                className={
                  "flex w-full justify-between rounded-sm items-center px-2 py-2 mb-2 hover:bg-gray-100 cursor-pointer text-[16px]! font-medium [&[data-state=open]>svg]:rotate-180"
                }
              >
                {item1.group}
                <ChevronDown className="transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                {item1.children?.map((item2, index2) => (
                  <Button
                    key={index2}
                    variant={
                      pathname === item2.url ? "ghost-selected" : "ghost"
                    }
                    onClick={() => navigate(item2.url)}
                    className={
                      "w-full flex gap-2 justify-start pl-2! border-none"
                    }
                  >
                    {item2.icon && (
                      <item2.icon style={{ width: 18, height: 18 }} />
                    )}
                    <span>{item2.title}</span>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item1.title}>
              <Button
                variant={pathname === item1.url ? "ghost-selected" : "ghost"}
                onClick={() => navigate(item1.url)}
                className={
                  "w-full flex gap-2 justify-start pl-2! border-none  text-[14px]!"
                }
              >
                {item1.icon && <item1.icon style={{ width: 18, height: 18 }} />}
                <span>{item1.title}</span>
              </Button>
            </SidebarMenuItem>
          )
        )}
      </SidebarContent>
    </Sidebar>
  );
}
