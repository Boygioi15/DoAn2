import { User, PackageSearch, ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Menu items, max depth: 2
const sidebarItems = [
  { title: "Quản lý tài khoản", url: "user", icon: User },
  {
    title: "Sản phẩm",
    icon: PackageSearch,
    children: [
      { title: "Quản lý sản phẩm", url: "product-management" },
      { title: "Thêm mới sản phẩm", url: "add-product" },
      { title: "Cập nhật sản phẩm", url: "update-product" },
    ],
  },
  {
    title: "Test",
    icon: PackageSearch,
    children: [{ title: "Test upload", url: "test-upload" }],
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="p-[8px] border-[#e5e5e5]">
      <SidebarHeader>
        <h1 className="text-xl font-medium">Trang admin</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {sidebarItems.map((item1) => {
            //
            if (!item1.children) {
              return (
                <SidebarMenuItem key={item1.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item1.url}>
                      <item1.icon style={{ width: "18px", height: "18px" }} />
                      <span>{item1.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            //
            return (
              <Collapsible
                key={item1.title}
                defaultOpen
                className="group/collapsible list-none"
              >
                <SidebarGroup>
                  <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="!p-0 my-2">
                      <h1 className="text-[16px] font-medium">{item1.title}</h1>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent />
                    {item1.children.map((item2) => {
                      return (
                        <SidebarMenuItem key={item2.title}>
                          <SidebarMenuButton asChild>
                            <Link to={item2.url}>
                              <span>{item2.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
