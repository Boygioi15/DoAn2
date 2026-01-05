import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDetail } from '../database/schemas/transaction.schema';
import { Product } from '../database/schemas/product.schema';
import { User } from '../database/schemas/user.schema';
import { Category } from '../database/schemas/category.schema';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderDetail.name) private orderDetailModel: Model<OrderDetail>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getOverviewStatistics(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Total revenue
    const revenueData = await this.orderModel.aggregate([
      {
        $match: {
          payment_state: 'succeeded',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment_cashout_price' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Total users
    const totalUsers = await this.userModel.countDocuments();

    // Total products
    const totalProducts = await this.productModel.countDocuments({
      isDeleted: false,
    });

    // Pending orders
    const pendingOrders = await this.orderModel.countDocuments({
      delivery_state: 'pending',
    });

    // Ongoing orders
    const ongoingOrders = await this.orderModel.countDocuments({
      delivery_state: 'ongoing',
    });

    return {
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      totalOrders: revenueData[0]?.totalOrders || 0,
      totalUsers,
      totalProducts,
      pendingOrders,
      ongoingOrders,
    };
  }

  async getRevenueStatistics(
    period: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    const groupFormat = this.getGroupFormat(period);

    const revenueData = await this.orderModel.aggregate([
      {
        $match: {
          payment_state: 'succeeded',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$payment_cashout_price' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenueData.map((item) => ({
      period: item._id,
      revenue: item.revenue,
      orderCount: item.orderCount,
    }));
  }

  async getOrderStatistics(
    period: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    const groupFormat = this.getGroupFormat(period);

    // Orders by status over time
    const ordersByStatus = await this.orderModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: {
            period: groupFormat,
            status: '$delivery_state',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.period': 1 } },
    ]);

    // Overall status distribution
    const statusDistribution = await this.orderModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: '$delivery_state',
          count: { $sum: 1 },
        },
      },
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await this.orderModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: '$payment_method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment_cashout_price' },
        },
      },
    ]);

    // Payment state distribution
    const paymentStateDistribution = await this.orderModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: '$payment_state',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      ordersByStatus: ordersByStatus.map((item) => ({
        period: item._id.period,
        status: item._id.status,
        count: item.count,
      })),
      statusDistribution: statusDistribution.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      paymentMethodDistribution: paymentMethodDistribution.map((item) => ({
        method: item._id,
        count: item.count,
        totalAmount: item.totalAmount,
      })),
      paymentStateDistribution: paymentStateDistribution.map((item) => ({
        state: item._id,
        count: item.count,
      })),
    };
  }

  async getProductStatistics(limit: number) {
    // Top selling products
    const topProducts = await this.orderDetailModel.aggregate([
      {
        $group: {
          _id: '$productId',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$cashoutPrice', '$quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit.toString()) },
    ]);

    // Get product details
    const productIds = topProducts.map((p) => p._id);
    const products = await this.productModel.find({
      productId: { $in: productIds },
    });

    const productsMap = {};
    products.forEach((p) => {
      productsMap[p.productId] = p;
    });
    console.log('P', products);
    const topProductsWithDetails = topProducts.map((item) => ({
      productId: item._id,
      productName: productsMap[item._id]?.name || 'Đã bị xóa',
      totalSold: item.totalSold,
      totalRevenue: item.totalRevenue,
      image: productsMap[item._id]?.display_thumbnail_image || '',
    }));

    // Product status overview
    const productStats = await this.productModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] },
          },
          drafted: { $sum: { $cond: [{ $eq: ['$isDrafted', true] }, 1, 0] } },
          deleted: { $sum: { $cond: [{ $eq: ['$isDeleted', true] }, 1, 0] } },
        },
      },
    ]);

    return {
      topProducts: topProductsWithDetails,
      productStats: productStats[0] || {
        total: 0,
        published: 0,
        drafted: 0,
        deleted: 0,
      },
    };
  }

  async getCategoryStatistics(startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Get all orders with date filter
    const orders = await this.orderModel
      .find({
        payment_state: 'succeeded',
        ...dateFilter,
      })
      .select('_id');

    const orderIds = orders.map((o) => o._id);

    // Get order details for these orders
    const orderDetails = await this.orderDetailModel
      .find({
        orderId: { $in: orderIds },
      })
      .select('productId quantity cashoutPrice');

    // Get product categories
    const productIds = [...new Set(orderDetails.map((od) => od.productId))];
    const products = await this.productModel
      .find({
        productId: { $in: productIds },
      })
      .select('productId categoryId');

    const productCategoryMap = {};
    products.forEach((p) => {
      productCategoryMap[p.productId] = p.categoryId;
    });

    // Aggregate by category
    const categoryStats = {};
    orderDetails.forEach((od) => {
      const categoryId = productCategoryMap[od.productId];
      if (!categoryId) return;

      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      categoryStats[categoryId].totalSold += od.quantity;
      categoryStats[categoryId].totalRevenue += od.cashoutPrice * od.quantity;
    });

    // Get category details
    const categoryIds = Object.keys(categoryStats);
    const categories = await this.categoryModel.find({
      categoryId: { $in: categoryIds },
    });

    const categoriesMap = {};
    categories.forEach((c) => {
      categoriesMap[c.categoryId] = c;
    });

    const categoryStatsWithDetails = Object.entries(categoryStats).map(
      ([categoryId, stats]: [string, any]) => ({
        categoryId,
        categoryName: categoriesMap[categoryId]?.categoryName || 'Unknown',
        totalSold: stats.totalSold,
        totalRevenue: stats.totalRevenue,
      }),
    );

    // Sort by revenue
    categoryStatsWithDetails.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return categoryStatsWithDetails;
  }

  async getUserStatistics(
    period: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter = this.buildDateFilter(startDate, endDate, 'createdAt');
    const groupFormat = this.getGroupFormat(period, 'createdAt');

    // New users over time
    const newUsers = await this.userModel.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total user count
    const totalUsers = await this.userModel.countDocuments();

    // Banned users
    const bannedUsers = await this.userModel.countDocuments({
      isBanned: true,
    });

    return {
      newUsers: newUsers.map((item) => ({
        period: item._id,
        count: item.count,
      })),
      totalUsers,
      bannedUsers,
      activeUsers: totalUsers - bannedUsers,
    };
  }

  private buildDateFilter(
    startDate?: string,
    endDate?: string,
    field: string = 'createdAt',
  ) {
    const filter: any = {};
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) {
        filter[field].$gte = new Date(startDate);
      }
      if (endDate) {
        filter[field].$lte = new Date(endDate);
      }
    }
    return filter;
  }

  private getGroupFormat(period: string, field: string = 'createdAt') {
    const dateField = `$${field}`;
    switch (period) {
      case 'day':
        return {
          $dateToString: { format: '%Y-%m-%d', date: dateField },
        };
      case 'week':
        return {
          $dateToString: { format: '%Y-W%V', date: dateField },
        };
      case 'year':
        return {
          $dateToString: { format: '%Y', date: dateField },
        };
      case 'month':
      default:
        return {
          $dateToString: { format: '%Y-%m', date: dateField },
        };
    }
  }
}
