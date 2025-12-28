import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ban, EllipsisVertical, Lock, Trash, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Status Badge Config
const STATUS_CONFIG = {
  normal: {
    label: "Vẫn ổn",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  banned: {
    label: "Bị khóa",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export function CustomerTable({
  data,
  startIndex,
  selectedId,
  onRowClick,
  onBan,
  onUnban,
}) {
  return (
    <div className="[&>div]:rounded-sm [&>div]:border  [&>div]:border-gray-400 w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[60px] text-center">STT</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className={"text-center"}>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((user, index) => {
              const statusStyle = user.isBanned
                ? STATUS_CONFIG["banned"]
                : STATUS_CONFIG["normal"];
              const isSelected = selectedId === user.userId;

              return (
                <TableRow
                  key={index}
                  className={cn(
                    "cursor-pointer transition-colors h-16",
                    isSelected
                      ? "bg-blue-50/50 border-l-4 border-l-blue-600"
                      : "hover:bg-slate-50"
                  )}
                  onClick={() => onRowClick(user.userId)}
                >
                  <TableCell className="text-slate-500 text-center">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-slate-200 text-xs">
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-sm">
                          {user.name || "Khách vãng lai"}
                        </span>
                        {/* Example of e-commerce metric */}
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          ID: {user.userId?.slice(-12)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-700">{user.email}</span>
                      <span className="text-slate-500 text-xs">
                        {user.phone || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyle.className}>
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2 items-center justify-center">
                    {!user.isBanned ? (
                      <Button
                        variant={"ghost-destructive"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBan(user.userId);
                        }}
                      >
                        <Lock />
                      </Button>
                    ) : (
                      <Button
                        variant={"ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnban(user.userId);
                        }}
                      >
                        <Unlock />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="grid grid-cols-[2fr_8fr]">
                          <Trash className="h-4 w-4" />
                          <span>Xóa người dùng</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-slate-500"
              >
                Không tìm thấy khách hàng nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
