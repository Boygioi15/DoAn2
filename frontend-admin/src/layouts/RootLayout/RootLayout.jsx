import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import Breadcrumbs from "@/reuseables/Breadcrumb";
export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col p-[20px]  bg-[rgb(250,250,250)] w-[100%]">
        <div className="flex flex-row items-center gap-[8px] mb-[10px] ">
          <SidebarTrigger />
          |
          <Breadcrumbs />
        </div>
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
