import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  ArchiveIcon,
  PencilIcon,
  Trash2Icon,
  LockOpen,
  Lock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import userApi from "@/api/userApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserManagementPage() {
  const [userList, setUserList] = useState([]);
  const getUserList = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUserList(response.data.allUser);
    } catch (error) {
      toast.error("Có lỗi khi lấy dữ liệu tài khoản");
    }
  };
  useEffect(() => {
    getUserList();
  }, []);
  return (
    <div className="page-layout">
      <h1>Quản lý tài khoản</h1>
      <div className="page-toolbar">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            getUserList();
          }}
          title="Làm mới"
        >
          <RefreshCcw />
        </Button>
        <input
          aria-label="Tìm kiếm"
          placeholder="Tìm kiếm"
          className="search-input"
        />
      </div>

      <section className="table-wrapper">
        <Table>
          <TableCaption>Danh sách tài khoản người dùng</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">STT</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-0">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList &&
              userList.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.gender || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-green-500"
                    >
                      <LockOpen />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-red-500"
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}
