import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Ban,
  History,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function CustomerDetailPanel({
  user,
  onClose,
  onBan,
  onUnban,
  getUserDetail,
}) {
  if (!user) return null;
  const [userDetail, setUserDetail] = useState({
    defaultAddress: null,
  });
  const processUserDetail = async (userId) => {
    const result = await getUserDetail(userId);
    console.log("R: ", result);
    let address = null;
    if (
      !result.data.defaultUserAddress ||
      result.data.defaultUserAddress.length === 0
    )
      address = null;
    else {
      address = result.data.defaultUserAddress[0];
    }
    console.log("A: ", address);
    setUserDetail({
      defaultAddress: address,
    });
  };
  useEffect(() => {
    if (user && user.userId) {
      processUserDetail(user.userId);
    }
  }, [user]);
  return (
    <ScrollArea className="h-full flex flex-col bg-white absolute inset-0">
      {/* 1. Header with Actions */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-bold text-slate-800">Hồ sơ khách hàng</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Identity Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-3xl bg-indigo-50 text-indigo-600">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="mt-2 flex justify-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3">
                  Khách hàng
                </Badge>
                {user.isBanned ? (
                  <Badge
                    variant="outline"
                    className={"bg-rose-50 text-rose-700 border-rose-200"}
                  >
                    Bị khóa
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={
                      "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }
                  >
                    Vẫn ổn
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Thông tin cá nhân
            </h4>
            <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <InfoRow icon={Phone} label="Điện thoại" value={user.phone} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow
                icon={MapPin}
                label="Địa chỉ mặc định"
                value={
                  userDetail.defaultAddress
                    ? userDetail.defaultAddress.address_detail
                    : "Chưa thiết lập"
                }
              />
              <InfoRow
                icon={Calendar}
                label="Ngày đăng ký"
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"
                }
              />
            </div>
          </div>

          {/* E-commerce Stats (Mock UI) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Lịch sử hoạt động
            </h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-3 border-b flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-slate-500" /> Đơn hàng gần đây
              </div>
              {/* Placeholder for orders */}
              <div className="p-4 text-center text-sm text-slate-500 py-8">
                Chưa có dữ liệu đơn hàng
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Vùng quản trị
            </h4>
            <div className="border border-red-100 rounded-lg p-4 bg-red-50/30">
              <p className="text-xs text-red-600 mb-3">
                Nếu phát hiện hành vi gian lận hoặc vi phạm chính sách, bạn có
                thể khóa tài khoản này.
              </p>
              <Button
                variant="destructive"
                className="w-full "
                onClick={() => {
                  !user.isBanned ? onBan(user.userId) : onUnban(user.userId);
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                {!user.isBanned ? "Khóa tài khoản này" : "Mở khóa tài khoản"}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </ScrollArea>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span
        className="text-sm font-medium text-slate-900 text-right max-w-[200px] truncate"
        title={value}
      >
        {value || "---"}
      </span>
    </div>
  );
}
