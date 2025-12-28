import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  async getOrderList(@Query() q) {
    const productList = await this.orderService.getOrderList({
      filter: {
        deliveryState: q.deliveryState,

        userName: q.userName,
        userPhone: q.userPhone,
        userAuthorized: q.userAuthorized,

        fromDate: q.fromDate,
        toDate: q.toDate,

        orderId: q.orderId,
        paymentState: q.paymentState,
      },
      pagination: {
        from: q.from || 1,
        size: q.size || 10,
      },
      sortBy: q.sortBy || 'newest',
    });
    return productList;
  }
  @Get(':orderId')
  async getOrderDetail(orderId: string) {
    return await this.orderService.getOrderDetail(orderId);
  }
}
