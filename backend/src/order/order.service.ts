import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Mongoose } from 'mongoose';
import {
  Order,
  OrderDetail,
  OrderDetailDocument,
  OrderDocument,
} from 'src/database/schemas/transaction.schema';
const delivery_state_enum = [
  'pending',
  'ongoing',
  'delivered',
  'succeeded',
  'failed',
  'canceled',
];
const payment_state_enum = [
  'created',
  'pending',
  'succeeded',
  'failed',
  'cancelled',
];
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderDetail.name)
    private readonly orderDetailModel: Model<OrderDetailDocument>,
  ) {}
  async buildOrderQueryPipeline(
    filter: {
      deliveryState: string;

      userName: string;
      userPhone: string;
      userAuthorized: string;

      fromDate: Date;
      toDate: Date;

      orderId: string;
      paymentState: string;
    },
    pagination: {
      from: number;
      size: number;
    },
    sortBy: string,
  ) {
    const {
      deliveryState,

      userName,
      userPhone,
      userAuthorized,

      fromDate,
      toDate,

      orderId,
      paymentState,
    } = filter;
    const { from, size } = pagination;
    const queryPipeline: any = [];
    const matchStage: any = {};
    if (deliveryState) {
      for (const state of delivery_state_enum) {
        if (deliveryState === state) {
          matchStage.delivery_state = state;
        }
      }
    }

    if (userName) {
      matchStage.address_name = { $include: userName };
    }
    if (userPhone) {
      matchStage.address_phone = { $include: userPhone };
    }
    if (userAuthorized) {
      if (userAuthorized === 'authorized') {
        matchStage.reference_user = { $ne: null };
      } else if (userAuthorized === 'anonymous') {
        matchStage.reference_user = { $eq: null };
      }
    }
    if (fromDate) {
      matchStage.createdAt = { $gte: fromDate };
    }
    if (toDate) {
      matchStage.createdAt = { $lte: toDate };
    }
    if (orderId) {
      matchStage._id = { $include: new mongoose.Types.ObjectId(orderId) };
    }
    if (paymentState) {
      for (const state of payment_state_enum) {
        if (paymentState === state) {
          matchStage.delivery_state = state;
        }
      }
    }
    //sort
    const sortObj: any = {};

    if (sortBy === 'newest') sortObj.createdAt = -1;
    if (sortBy === 'oldest') sortObj.createdAt = 1;

    //pagination:
    const skip = (Number(from) - 1) * size;

    if (Object.keys(matchStage).length > 0) {
      queryPipeline.push({ $match: matchStage });
    }
    if (Object.keys(sortObj).length > 0) {
      queryPipeline.push({
        $facet: {
          orderList: [
            { $sort: sortObj },
            { $skip: skip },
            { $limit: Number(size) },
          ],
          total: [{ $count: 'count' }],
        },
      });
    } else {
      queryPipeline.push({
        $facet: {
          orderList: [{ $skip: skip }, { $limit: Number(size) }],
          total: [{ $count: 'count' }],
        },
      });
    }
    queryPipeline.push({ $match: {} });
    return queryPipeline;
  }
  async getOrderList({ filter, sortBy, pagination }) {
    const queryPipeline = await this.buildOrderQueryPipeline(
      filter,
      pagination,
      sortBy,
    );
    const result = await this.orderModel.aggregate(queryPipeline);
    // .sort(sortObj),
    const orderList = result[0].orderList;

    //admin
    // console.log('Result: ', result[0]);
    let totalItem = 0;
    if (result[0].orderList.length > 0) {
      totalItem = result[0].total[0].count;
    }
    return { totalItem, orderList };
  }
  async getOrderDetail(orderId: string) {
    const orderMetadata = await this.orderModel.findById(
      new mongoose.Types.ObjectId(orderId),
    );
    const orderDetailList = await this.orderDetailModel.find({ orderId });
  }
}
