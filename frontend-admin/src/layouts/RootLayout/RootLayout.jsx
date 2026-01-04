import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSideBar from "./AppSidebar";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Separator } from "@/components/ui/separator";
import Breadcrumbs from "@/reusable-component/Breadcrumb";
import AvatarBlock from "@/reusable-component/AvatarBlock";
import { Outlet, useLocation } from "react-router-dom";
import { routeNameMap } from "@/constants";
export default function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const pathParts = pathname.split("/").filter(Boolean);
  let screenName = "Trang chủ";
  if (pathParts.length > 0) {
    screenName = routeNameMap[pathParts[pathParts.length - 1]];
  }
  return (
    <Suspense>
      <SidebarProvider className="bg-gray-100 ">
        {/* App content begin here */}
        <AppSideBar />
        <div className="flex flex-col w-full pt-3 mx-4">
          <div className="flex gap-4 items-center justify-between ">
            <div className="flex flex-col gap-1">
              <Breadcrumbs className={"mb-2"} />
              <h1>{screenName}</h1>
            </div>
            <AvatarBlock />
          </div>
          <main className="w-full h-fit min-h-screen">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
    </Suspense>
  );
}
