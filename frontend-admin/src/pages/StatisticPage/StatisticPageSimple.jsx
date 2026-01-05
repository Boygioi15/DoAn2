import { useState, useEffect } from "react";
import statisticApi from "@/api/statisticApi";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  Award,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticPageSimple() {
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [userData, setUserData] = useState(null);

  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [overview, revenue, orders, products, categories, users] =
        await Promise.all([
          statisticApi.getOverviewStatistics(),
          statisticApi.getRevenueStatistics(period),
          statisticApi.getOrderStatistics(period),
          statisticApi.getProductStatistics(10),
          statisticApi.getCategoryStatistics(),
          statisticApi.getUserStatistics(period),
        ]);

      setOverviewData(overview.data);
      setRevenueData(revenue.data);
      setOrderData(orders.data);
      setProductData(products.data);
      setCategoryData(categories.data);
      setUserData(users.data);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(overviewData?.totalRevenue || 0)}
          icon={<DollarSign className="text-green-600" size={24} />}
          trend="+12%"
          trendUp={true}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={overviewData?.totalOrders || 0}
          icon={<ShoppingCart className="text-blue-600" size={24} />}
          trend="+8%"
          trendUp={true}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Tổng Người Dùng"
          value={overviewData?.totalUsers || 0}
          icon={<Users className="text-cyan-600" size={24} />}
          trend="+5%"
          trendUp={true}
          iconBg="bg-cyan-100"
        />
        <StatCard
          title="Tổng Sản Phẩm"
          value={overviewData?.totalProducts || 0}
          icon={<Package className="text-orange-600" size={24} />}
          trend="+2%"
          trendUp={true}
          iconBg="bg-orange-100"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 size={20} />
                Biểu Đồ Doanh Thu
              </CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo Ngày</SelectItem>
                  <SelectItem value="week">Theo Tuần</SelectItem>
                  <SelectItem value="month">Theo Tháng</SelectItem>
                  <SelectItem value="year">Theo Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {revenueData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Thời Gian
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        Doanh Thu
                      </th>
                      <th className="text-right py-3 px-4 font-semibold">
                        Số Đơn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">
                          {item.period}
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 font-bold">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-sm">
                            {item.orderCount} đơn
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-25" />
                <p>Không có dữ liệu doanh thu</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Status & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 size={20} />
              Trạng Thái Giao Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {getAllDeliveryStates(orderData?.statusDistribution).map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${getDeliveryStateBadgeClass(
                          item.status
                        )}`}
                      >
                        {translateDeliveryState(item.status)}
                      </span>
                    </div>
                    <span className="font-bold">{item.count} đơn</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <DollarSign size={20} />
              Trạng Thái Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {getAllPaymentStates(orderData?.paymentStateDistribution).map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${getPaymentStateBadgeClass(
                          item.state
                        )}`}
                      >
                        {translatePaymentState(item.state)}
                      </span>
                    </div>
                    <span className="font-bold">{item.count} đơn</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Tag size={20} />
              Phương Thức Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {orderData?.paymentMethodDistribution?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <span className="font-semibold uppercase">{item.method}</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(item.totalAmount)}
                    </div>
                    <small className="text-gray-600">
                      {item.count} giao dịch
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="mb-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Award size={20} />
              Top 10 Sản Phẩm Bán Chạy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4 font-semibold">#</th>
                    <th className="text-left py-4 px-4 font-semibold">
                      Sản Phẩm
                    </th>
                    <th className="text-right py-4 px-4 font-semibold">
                      Đã Bán
                    </th>
                    <th className="text-right py-4 px-4 font-semibold">
                      Doanh Thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productData?.topProducts?.map((product, index) => (
                    <tr
                      key={product.productId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="w-12 h-12 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <span className="font-semibold line-clamp-2">
                            {product.productName}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-semibold">
                        {product.totalSold}
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-green-600">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="mb-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Tag size={20} />
              Hiệu Suất Theo Danh Mục
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4 font-semibold">
                      Danh Mục
                    </th>
                    <th className="text-right py-4 px-4 font-semibold">
                      Đã Bán
                    </th>
                    <th className="text-right py-4 px-4 font-semibold">
                      Doanh Thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData?.map((category) => (
                    <tr
                      key={category.categoryId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 font-semibold">
                        {category.categoryName}
                      </td>
                      <td className="text-right py-4 px-4">
                        {category.totalSold}
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-green-600">
                        {formatCurrency(category.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User & Product Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users size={20} />
                Thống Kê Người Dùng
              </CardTitle>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Theo Ngày</SelectItem>
                  <SelectItem value="week">Theo Tuần</SelectItem>
                  <SelectItem value="month">Theo Tháng</SelectItem>
                  <SelectItem value="year">Theo Năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600 mb-1">
                  {userData?.totalUsers || 0}
                </h3>
                <small className="text-gray-600">Tổng</small>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-2xl font-bold text-green-600 mb-1">
                  {userData?.activeUsers || 0}
                </h3>
                <small className="text-gray-600">Hoạt động</small>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <h3 className="text-2xl font-bold text-red-600 mb-1">
                  {userData?.bannedUsers || 0}
                </h3>
                <small className="text-gray-600">Bị cấm</small>
              </div>
            </div>
            <h6 className="font-semibold mb-3">
              Người Dùng Mới ({getPeriodLabel(period)})
            </h6>
            <div className="space-y-2">
              {userData?.newUsers?.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <span className="font-semibold">{item.period}</span>
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-sm">
                    {item.count} người
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Package size={20} />
              Tổng Quan Sản Phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h2 className="text-3xl font-bold mb-2">
                  {productData?.productStats?.total || 0}
                </h2>
                <p className="text-gray-600">Tổng Sản Phẩm</p>
              </div>
              <div className="text-center p-4 border border-green-300 rounded-lg">
                <h2 className="text-3xl font-bold text-green-600 mb-2">
                  {productData?.productStats?.published || 0}
                </h2>
                <p className="text-gray-600">Đã Xuất Bản</p>
              </div>
              <div className="text-center p-4 border border-yellow-300 rounded-lg">
                <h2 className="text-3xl font-bold text-yellow-600 mb-2">
                  {productData?.productStats?.drafted || 0}
                </h2>
                <p className="text-gray-600">Nháp</p>
              </div>
              <div className="text-center p-4 border border-red-300 rounded-lg">
                <h2 className="text-3xl font-bold text-red-600 mb-2">
                  {productData?.productStats?.deleted || 0}
                </h2>
                <p className="text-gray-600">Đã Xóa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value, icon, trend, trendUp, subtitle, iconBg }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow border-none">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="text-gray-600 text-lg font-medium block mb-2">
              {title}
            </span>
            <h3 className="text-xl font-bold mb-0">{value}</h3>
            {trend && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-sm ${
                    trendUp
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {trendUp ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  {trend}
                </span>
              </div>
            )}
            {subtitle && (
              <small className="text-gray-600 block mt-2">{subtitle}</small>
            )}
          </div>
          <div className={`${iconBg} p-4 rounded-lg`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper Functions
function getPeriodLabel(period) {
  const labels = {
    day: "Ngày",
    week: "Tuần",
    month: "Tháng",
    year: "Năm",
  };
  return labels[period] || "Tháng";
}

function getDeliveryStateConfig(state) {
  const configs = {
    pending: {
      icon: <Clock className="text-yellow-600" size={24} />,
      iconBg: "bg-yellow-100",
    },
    ongoing: {
      icon: <TrendingUp className="text-blue-600" size={24} />,
      iconBg: "bg-blue-100",
    },
    delivered: {
      icon: <Package className="text-cyan-600" size={24} />,
      iconBg: "bg-cyan-100",
    },
    succeeded: {
      icon: <CheckCircle2 className="text-green-600" size={24} />,
      iconBg: "bg-green-100",
    },
    failed: {
      icon: <ArrowDown className="text-red-600" size={24} />,
      iconBg: "bg-red-100",
    },
    canceled: {
      icon: <ShoppingCart className="text-gray-600" size={24} />,
      iconBg: "bg-gray-100",
    },
  };
  return (
    configs[state] || {
      icon: <ShoppingCart className="text-gray-600" size={24} />,
      iconBg: "bg-gray-100",
    }
  );
}

function getAllDeliveryStates(statusDistribution) {
  const allStates = [
    "pending",
    "ongoing",
    "delivered",
    "succeeded",
    "failed",
    "canceled",
  ];
  const statusMap = {};

  // Map existing statuses
  statusDistribution?.forEach((item) => {
    statusMap[item.status] = item.count;
  });

  // Return all states with count 0 for missing ones
  return allStates.map((state) => ({
    status: state,
    count: statusMap[state] || 0,
  }));
}

function getAllPaymentStates(paymentStateDistribution) {
  const allStates = ["created", "pending", "succeeded", "failed", "cancelled"];
  const stateMap = {};

  // Map existing states
  paymentStateDistribution?.forEach((item) => {
    stateMap[item.state] = item.count;
  });

  // Return all states with count 0 for missing ones
  return allStates.map((state) => ({
    state: state,
    count: stateMap[state] || 0,
  }));
}

function translateDeliveryState(state) {
  const translations = {
    pending: "Đang chờ xử lý",
    ongoing: "Đang được giao",
    delivered: "Đã giao",
    succeeded: "Thành công",
    failed: "Thất bại",
    canceled: "Đã hủy",
  };
  return translations[state] || state;
}

function getDeliveryStateBadgeClass(state) {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    ongoing: "bg-blue-100 text-blue-800",
    delivered: "bg-cyan-100 text-cyan-800",
    succeeded: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
  };
  return classes[state] || "bg-gray-100 text-gray-800";
}

function translatePaymentState(state) {
  const translations = {
    created: "Mới tạo",
    pending: "Đang xử lý",
    succeeded: "Đã thành công",
    failed: "Thất bại",
    cancelled: "Đã hủy",
  };
  return translations[state] || state;
}

function getPaymentStateBadgeClass(state) {
  const classes = {
    created: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    succeeded: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return classes[state] || "bg-gray-100 text-gray-800";
}
