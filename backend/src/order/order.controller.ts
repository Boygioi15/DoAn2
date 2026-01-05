import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
  async getOrderDetail(@Param('orderId') orderId: string) {
    return await this.orderService.getOrderDetail(orderId);
  }

  @Post(':orderId/payment ')
  async updateOrderPaymentState(
    @Param('orderId') orderId: string,
    @Body() body: { paymentState: string },
  ) {
    return await this.orderService.updateOrderPaymentState(
      orderId,
      body.paymentState,
    );
  }

  @Post(':orderId/delivery')
  async updateOrderDeliveryState(
    @Param('orderId') orderId: string,
    @Body() body: { deliveryState: string },
  ) {
    return await this.orderService.updateOrderDeliveryState(
      orderId,
      body.deliveryState,
    );
  }
}
