import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Archive, DollarSign } from "lucide-react";

export default function ProductOverview({ productList }) {
  // Calculate stats dynamically
  const totalProducts = productList.length;
  const lowStockCount = productList.filter((p) => p.inStorageTotal < 10).length;
  const activeCount = productList.filter(
    (p) => p.isPublished && !p.isDeleted
  ).length;
  // Example calculation (ensure your data has these fields)
  const totalValue = productList.reduce(
    (acc, curr) => acc + (curr.sellingPriceBot || 0),
    0
  );

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Đang hoạt động",
      value: activeCount,
      icon: DollarSign, // Or any relevant icon
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Tổng tồn kho",
      value: productList.reduce((acc, p) => acc + (p.inStorageTotal || 0), 0),
      icon: Archive,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              Cập nhật thời gian thực
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
