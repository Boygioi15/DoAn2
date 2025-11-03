import {
  Calendar,
  ChevronDown,
  Home,
  Inbox,
  Search,
  Settings,
} from "lucide-react";

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

// Menu items, max depth: 2
const sidebarItems = [
  { title: "Quản lý thông tin người dùng", url: "user", icon: Home },
  {
    title: "Sản phẩm",
    icon: Home,
    children: [
      { title: "Quản lý sản phẩm", url: "product-management", icon: Home },
      { title: "Thêm mới sản phẩm", url: "add-product", icon: Home },
      { title: "Cập nhật sản phẩm", url: "update-product", icon: Home },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>Trang admin</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {sidebarItems.map((item1) => {
            //
            if (!item1.children) {
              return (
                <SidebarMenuItem key={item1.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item1.url}>
                      <item1.icon />
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
                    <CollapsibleTrigger>
                      {item1.title}
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
                              <item2.icon />
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
