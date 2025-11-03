import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { routeNameMap } from '@/constants';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  //context
  const location = useLocation();
  const pathname = location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  // Skip breadcrumbs on /auth pages
  if (pathname.startsWith('/auth')) return null;

  // Build breadcrumb items dynamically, not handling param case yet!
  const crumbs = pathParts.map((part, index) => {
    const to = '/' + pathParts.slice(0, index + 1).join('/');
    const label =
      routeNameMap[part] ||
      decodeURIComponent(part)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === pathParts.length - 1;

    return (
      <React.Fragment key={to}>
        <BreadcrumbItem key={to}>
          {!isLast ? (
            <BreadcrumbLink asChild>
              <Link to={to}>{label}</Link>
            </BreadcrumbLink>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className="mb-2 px-4 px-[100px] pt-[12px] pb-[12px]">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Trang chủ</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathParts.length > 0 && <BreadcrumbSeparator />}
        {crumbs}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
