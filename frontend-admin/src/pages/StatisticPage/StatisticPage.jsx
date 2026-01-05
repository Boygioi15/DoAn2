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
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticPage() {
  const [overviewData, setOverviewData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [userData, setUserData] = useState(null);

  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setAnimateIn(true), 100);
    }
  }, [loading]);

  const loadStatistics = async () => {
    setLoading(true);
    setAnimateIn(false);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <div className="text-xl font-bold text-gray-800">
            Đang tải dữ liệu thống kê...
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Vui lòng đợi trong giây lát
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-12">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.15);
        }
        
        .chart-bar {
          transition: all 0.3s ease;
        }
        
        .chart-bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.02);
          transform-origin: bottom;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div
          className={`mb-10 ${animateIn ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="glass-effect rounded-3xl p-8 shadow-2xl border-2 border-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-5xl font-bold gradient-text mb-3">
                  Dashboard Thống Kê
                </h1>
                <p className="text-gray-600 text-lg font-medium">
                  Tổng quan hiệu suất kinh doanh của bạn
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[220px] h-12 bg-white border-2 border-blue-300 hover:border-blue-500 transition-all shadow-md text-base font-semibold">
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">📅 Theo Ngày</SelectItem>
                    <SelectItem value="week">📊 Theo Tuần</SelectItem>
                    <SelectItem value="month">📈 Theo Tháng</SelectItem>
                    <SelectItem value="year">📉 Theo Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Overview Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<Activity className="h-7 w-7" />}
            title="Tổng Quan Hiệu Suất"
            subtitle="Các chỉ số kinh doanh quan trọng"
            delay={0.1}
            animate={animateIn}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <AnimatedStatCard
              title="Tổng Doanh Thu"
              value={formatCurrency(overviewData?.totalRevenue || 0)}
              icon={<DollarSign className="h-11 w-11" />}
              bgColor="from-green-400 via-emerald-500 to-teal-500"
              textColor="text-green-700"
              delay={0.1}
              animate={animateIn}
            />
            <AnimatedStatCard
              title="Tổng Đơn Hàng"
              value={overviewData?.totalOrders || 0}
              icon={<ShoppingCart className="h-11 w-11" />}
              bgColor="from-blue-400 via-cyan-500 to-sky-500"
              textColor="text-blue-700"
              delay={0.2}
              animate={animateIn}
            />
            <AnimatedStatCard
              title="Tổng Người Dùng"
              value={overviewData?.totalUsers || 0}
              icon={<Users className="h-11 w-11" />}
              bgColor="from-purple-400 via-violet-500 to-indigo-500"
              textColor="text-purple-700"
              delay={0.3}
              animate={animateIn}
            />
            <AnimatedStatCard
              title="Tổng Sản Phẩm"
              value={overviewData?.totalProducts || 0}
              icon={<Package className="h-11 w-11" />}
              bgColor="from-orange-400 via-amber-500 to-yellow-500"
              textColor="text-orange-700"
              delay={0.4}
              animate={animateIn}
            />
          </div>
        </section>

        {/* Order Status Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<AlertCircle className="h-7 w-7" />}
            title="Trạng Thái Đơn Hàng"
            subtitle="Theo dõi trạng thái đơn hàng hiện tại"
            delay={0.2}
            animate={animateIn}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <AnimatedStatCard
              title="Đơn Chờ Xử Lý"
              value={overviewData?.pendingOrders || 0}
              icon={<Clock className="h-11 w-11" />}
              bgColor="from-yellow-400 via-amber-500 to-orange-400"
              textColor="text-yellow-700"
              delay={0.3}
              animate={animateIn}
              subtitle="Cần xử lý ngay"
            />
            <AnimatedStatCard
              title="Đơn Đang Giao"
              value={overviewData?.ongoingOrders || 0}
              icon={<TrendingUp className="h-11 w-11" />}
              bgColor="from-cyan-400 via-blue-500 to-indigo-500"
              textColor="text-cyan-700"
              delay={0.4}
              animate={animateIn}
              subtitle="Đang vận chuyển"
            />
          </div>
        </section>

        {/* Revenue Analytics Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<BarChart3 className="h-7 w-7" />}
            title="Phân Tích Doanh Thu"
            subtitle={`Xu hướng doanh thu theo ${getPeriodLabel(
              period
            ).toLowerCase()}`}
            delay={0.3}
            animate={animateIn}
          />
          <Card
            className={`glass-effect border-0 shadow-2xl mt-6 ${
              animateIn ? "animate-scale-in" : "opacity-0"
            }`}
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader className="border-b-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <span className="gradient-text">
                  Biểu Đồ Doanh Thu Theo {getPeriodLabel(period)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-5">
                {revenueData.length > 0 ? (
                  <div className="space-y-4">
                    {revenueData.map((item, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center gap-5">
                          <div className="w-36 text-sm font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">
                            {item.period}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-300 rounded-full h-10 overflow-hidden shadow-inner">
                              <div
                                className="chart-bar bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 h-full flex items-center justify-end pr-4 text-sm text-white font-bold rounded-full shadow-xl"
                                style={{
                                  width: `${
                                    (item.revenue /
                                      Math.max(
                                        ...revenueData.map((d) => d.revenue)
                                      )) *
                                    100
                                  }%`,
                                }}
                              >
                                {item.revenue > 0 &&
                                  formatCurrency(item.revenue)}
                              </div>
                            </div>
                          </div>
                          <div className="w-28 text-sm text-gray-700 font-semibold text-right bg-blue-50 px-3 py-2 rounded-lg">
                            {item.orderCount} đơn
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <BarChart3 className="h-20 w-20 mx-auto mb-5 text-gray-300" />
                    <p className="text-xl font-semibold">
                      Không có dữ liệu doanh thu
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Order & Payment Analytics Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<ShoppingCart className="h-7 w-7" />}
            title="Phân Tích Đơn Hàng & Thanh Toán"
            subtitle="Thống kê chi tiết về đơn hàng và phương thức thanh toán"
            delay={0.4}
            animate={animateIn}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-6">
            <Card
              className={`glass-effect border-0 shadow-2xl ${
                animateIn ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.6s" }}
            >
              <CardHeader className="border-b-2 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  Phân Bố Trạng Thái Đơn Hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orderData?.statusDistribution?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all border border-gray-200"
                    >
                      <span className="text-sm font-bold capitalize flex items-center gap-3">
                        <span
                          className={`w-4 h-4 rounded-full shadow-md ${getStatusColor(
                            item.status
                          )}`}
                        ></span>
                        {translateStatus(item.status)}
                      </span>
                      <span className="text-sm font-bold text-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                        {item.count} đơn
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`glass-effect border-0 shadow-2xl ${
                animateIn ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              <CardHeader className="border-b-2 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  Phương Thức Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orderData?.paymentMethodDistribution?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all border border-gray-200"
                    >
                      <span className="text-sm font-bold uppercase bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                        {item.method}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-700">
                          {formatCurrency(item.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-600 font-semibold">
                          {item.count} giao dịch
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Products Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<Award className="h-7 w-7" />}
            title="Sản Phẩm Bán Chạy"
            subtitle="Top 10 sản phẩm có doanh thu cao nhất"
            delay={0.5}
            animate={animateIn}
          />
          <Card
            className={`glass-effect border-0 shadow-2xl mt-6 ${
              animateIn ? "animate-scale-in" : "opacity-0"
            }`}
            style={{ animationDelay: "0.8s" }}
          >
            <CardHeader className="border-b-2 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <span className="gradient-text">
                  Top 10 Sản Phẩm Bán Chạy Nhất
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="text-left py-5 px-5 font-bold text-gray-800 text-base">
                        #
                      </th>
                      <th className="text-left py-5 px-5 font-bold text-gray-800 text-base">
                        Sản Phẩm
                      </th>
                      <th className="text-right py-5 px-5 font-bold text-gray-800 text-base">
                        Đã Bán
                      </th>
                      <th className="text-right py-5 px-5 font-bold text-gray-800 text-base">
                        Doanh Thu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productData?.topProducts?.map((product, index) => (
                      <tr
                        key={product.productId}
                        className="border-b hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all group"
                      >
                        <td className="py-5 px-5">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 text-white font-bold shadow-lg group-hover:scale-125 transition-transform">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.productName}
                                className="w-16 h-16 object-cover rounded-xl shadow-lg group-hover:scale-110 transition-transform border-2 border-white"
                              />
                            )}
                            <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors text-base">
                              {product.productName}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-5 px-5 font-bold text-gray-700 text-base">
                          {product.totalSold}
                        </td>
                        <td className="text-right py-5 px-5 font-bold text-green-600 text-base">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Category Performance Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<Tag className="h-7 w-7" />}
            title="Hiệu Suất Danh Mục"
            subtitle="Phân tích doanh thu theo từng danh mục sản phẩm"
            delay={0.6}
            animate={animateIn}
          />
          <Card
            className={`glass-effect border-0 shadow-2xl mt-6 ${
              animateIn ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.9s" }}
          >
            <CardHeader className="border-b-2 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Tag className="h-7 w-7 text-white" />
                </div>
                <span className="gradient-text">
                  Phân Tích Theo Danh Mục Sản Phẩm
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="text-left py-5 px-5 font-bold text-gray-800 text-base">
                        Danh Mục
                      </th>
                      <th className="text-right py-5 px-5 font-bold text-gray-800 text-base">
                        Đã Bán
                      </th>
                      <th className="text-right py-5 px-5 font-bold text-gray-800 text-base">
                        Doanh Thu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData?.map((category, index) => (
                      <tr
                        key={category.categoryId}
                        className="border-b hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                      >
                        <td className="py-5 px-5 font-bold text-gray-800 group-hover:text-indigo-600 transition-colors text-base">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 shadow-md"></span>
                            {category.categoryName}
                          </div>
                        </td>
                        <td className="text-right py-5 px-5 font-bold text-gray-700 text-base">
                          {category.totalSold}
                        </td>
                        <td className="text-right py-5 px-5 font-bold text-green-600 text-base">
                          {formatCurrency(category.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* User Statistics Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<Users className="h-7 w-7" />}
            title="Thống Kê Người Dùng"
            subtitle="Phân tích người dùng và xu hướng tăng trưởng"
            delay={0.7}
            animate={animateIn}
          />
          <Card
            className={`glass-effect border-0 shadow-2xl mt-6 ${
              animateIn ? "animate-scale-in" : "opacity-0"
            }`}
            style={{ animationDelay: "1s" }}
          >
            <CardHeader className="border-b-2 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <span className="gradient-text">Phân Tích Người Dùng</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-10">
                <div className="text-center p-8 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-blue-200">
                  <div className="text-5xl font-bold text-blue-700 mb-3">
                    {userData?.totalUsers || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Tổng Người Dùng
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-green-200">
                  <div className="text-5xl font-bold text-green-700 mb-3">
                    {userData?.activeUsers || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Người Dùng Hoạt Động
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-red-100 via-red-50 to-pink-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-red-200">
                  <div className="text-5xl font-bold text-red-700 mb-3">
                    {userData?.bannedUsers || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Người Dùng Bị Cấm
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xl mb-5 text-gray-800 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  Người Dùng Mới Theo {getPeriodLabel(period)}
                </h4>
                {userData?.newUsers?.map((item, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center gap-5">
                      <div className="w-36 text-sm font-bold text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">
                        {item.period}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-300 rounded-full h-10 overflow-hidden shadow-inner">
                          <div
                            className="chart-bar bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-full flex items-center justify-end pr-4 text-sm text-white font-bold rounded-full shadow-xl"
                            style={{
                              width: `${
                                (item.count /
                                  Math.max(
                                    ...userData.newUsers.map((d) => d.count)
                                  )) *
                                100
                              }%`,
                            }}
                          >
                            {item.count > 0 && `${item.count} người`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Product Status Overview Section */}
        <section className="mb-14">
          <SectionHeader
            icon={<Package className="h-7 w-7" />}
            title="Tổng Quan Sản Phẩm"
            subtitle="Trạng thái và phân loại sản phẩm trong hệ thống"
            delay={0.8}
            animate={animateIn}
          />
          <Card
            className={`glass-effect border-0 shadow-2xl mt-6 ${
              animateIn ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: "1.1s" }}
          >
            <CardHeader className="border-b-2 bg-gradient-to-r from-orange-50 via-amber-50 to-red-50">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <span className="gradient-text">Trạng Thái Sản Phẩm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
                <div className="text-center p-8 bg-gradient-to-br from-gray-200 via-gray-100 to-slate-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-gray-300">
                  <div className="text-5xl font-bold text-gray-800 mb-3">
                    {productData?.productStats?.total || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Tổng Sản Phẩm
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-green-200">
                  <div className="text-5xl font-bold text-green-700 mb-3">
                    {productData?.productStats?.published || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Đã Xuất Bản
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-yellow-200">
                  <div className="text-5xl font-bold text-yellow-700 mb-3">
                    {productData?.productStats?.drafted || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Nháp
                  </div>
                </div>
                <div className="text-center p-8 bg-gradient-to-br from-red-100 via-red-50 to-pink-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-red-200">
                  <div className="text-5xl font-bold text-red-700 mb-3">
                    {productData?.productStats?.deleted || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Đã Xóa
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({ icon, title, subtitle, delay, animate }) {
  return (
    <div
      className={`${animate ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600 font-medium mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full w-24 mt-3"></div>
    </div>
  );
}

// Animated Stat Card Component
function AnimatedStatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
  delay,
  animate,
  subtitle,
}) {
  return (
    <div
      className={`stat-card glass-effect rounded-2xl shadow-xl border-2 border-white overflow-hidden ${
        animate ? "animate-scale-in" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 font-semibold mt-2">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`p-4 bg-gradient-to-br ${bgColor} rounded-2xl shadow-xl transform hover:rotate-12 transition-transform`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
        <div
          className={`h-2 bg-gradient-to-r ${bgColor} rounded-full mt-4`}
        ></div>
      </div>
    </div>
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

function translateStatus(status) {
  const translations = {
    pending: "Chờ xử lý",
    ongoing: "Đang giao",
    delivered: "Đã giao",
    succeeded: "Thành công",
    failed: "Thất bại",
    canceled: "Đã hủy",
  };
  return translations[status] || status;
}

function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-400",
    ongoing: "bg-blue-400",
    delivered: "bg-green-400",
    succeeded: "bg-emerald-400",
    failed: "bg-red-400",
    canceled: "bg-gray-400",
  };
  return colors[status] || "bg-gray-400";
}
