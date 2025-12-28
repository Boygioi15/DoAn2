import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { routeNameMap } from "@/constants";
import { cn } from "@/lib/utils";
import React from "react";
import { useLocation } from "react-router-dom";

export default function Breadcrumbs({ className }) {
  //context
  const location = useLocation();
  const pathname = location.pathname;
  const pathParts = pathname.split("/").filter(Boolean);

  console.log(pathname);
  // Build breadcrumb items dynamically, not handling param case yet!
  const crumbs = pathParts.map((part, index) => {
    const to = "/" + pathParts.slice(0, index + 1).join("/");
    const label = routeNameMap[part] || "Define tên route giùm cái";
    const isLast = index === pathParts.length - 1;

    return (
      <React.Fragment key={to}>
        <BreadcrumbItem key={to}>
          {!isLast ? (
            <BreadcrumbLink asChild href={to}>
              {label}
            </BreadcrumbLink>
          ) : (
            <span className="text-muted-foreground">
              <b>{label}</b>
            </span>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
        </BreadcrumbItem>
        {pathParts.length > 0 && <BreadcrumbSeparator />}
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
