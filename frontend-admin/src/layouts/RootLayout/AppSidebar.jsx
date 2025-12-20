"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { Book, Box, Pen, Pencil, UserCircle2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
      { title: "Thêm sản phẩm mới", url: "/add-product", icon: Pencil },
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
            <Accordion
              type="single"
              collapsible
              className="w-full py-2"
              defaultValue="item-1"
            >
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                defaultOpen
              >
                <AccordionTrigger
                  className={
                    "px-2 py-2 mb-2 hover:bg-gray-100 cursor-pointer text-[14px]!"
                  }
                >
                  {item1.group}
                </AccordionTrigger>
                <AccordionContent>
                  {item1.children?.map((item2) => (
                    <AccordionItem key={item2.title} asChild>
                      <Button
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
                    </AccordionItem>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
