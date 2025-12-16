import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Redirect,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { CartService } from 'src/cart/cart.service';
import { AddressInfoFe, CartItemFe, PaymentDetailFe } from './transaction.dto';
import { PaymentGatewayService } from './payment-gateway.service';
import { EmailService } from 'src/email/email.service';
import mongoose, { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}
  @UseGuards(JwtGuard)
  @Get('transaction-detail')
  async getTransactionDetail(@Request() req) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    const result =
      await this.transactionService.getTransactionInfoAndUpdateCart(
        cart.cartId,
      );
    return result;
  }
  @UseGuards(JwtGuard)
  @Post('confirm-transaction')
  async confirmTransaction(
    @Request() req,
    @Body('email') email: string,
    @Body('cartItemList') cartItemList: CartItemFe[],
    @Body('paymentDetail') paymentDetailFe: PaymentDetailFe,
    @Body('addressInfo') addressInfo: AddressInfoFe,
    @Body('redirectUrl') redirectUrl: string,
  ) {
    if (!redirectUrl) {
      throw new BadRequestException('Chưa cung cấp URL trả về');
    }
    if (!email) {
      throw new BadRequestException('Chưa cung cấp email');
    }
    const userId = req.user.userId;
    if (!addressInfo.reference_address) {
      throw new BadRequestException('Chưa cung cấp địa chỉ!');
    }
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    //verify that body match that of db.
    const { itemListDetail, paymentDetail } =
      await this.transactionService.verifyTransactionDataFromFe(
        cart.cartId,
        cartItemList,
        paymentDetailFe,
      );
    //////TRANSACTION BLOCK ?????

    const session = await this.connection.startSession();
    let orderId = '';
    try {
      session.startTransaction();
      console.log('Data from fe: valid ');
      orderId = (
        await this.transactionService.createNewOrder(
          userId,
          addressInfo,
          itemListDetail,
          paymentDetail,
          email,

          session,
        )
      ).toString();
      console.log('Order created for user: ', userId, '\nOrderId: ', orderId);
      const stockUpdatePromises =
        await this.transactionService.updateVariantStock(
          itemListDetail,
          session,
        );
      await Promise.all(stockUpdatePromises);
      console.log('Stock updated');
      // throw new Error();
      // user has a pending order
      await this.transactionService.updateUserPending(
        userId,
        orderId.toString(),
        true,

        session,
      );
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new InternalServerErrorException('Có lỗi khi tạo dữ liệu đơn hàng');
    } finally {
      await session.endSession();
    }

    //////TRANSACTION BLOCK ?????

    //create payment link
    let payment_url = '';
    let finalReturnUrl = redirectUrl + `?orderId1=${orderId}`;
    const payment_gateway_code = Math.floor(
      Math.pow(10, 10) + Math.random() * 8 * Math.pow(10, 10),
    );
    console.log('Code: ', payment_gateway_code);
    if (paymentDetail.payment_method === 'momo') {
      const result = await this.paymentGatewayService.createPaymentLink_MOMO(
        payment_gateway_code.toString(),
        orderId,
        2000 + paymentDetail.payment_cashout_price / 1000,
        finalReturnUrl,
      );
      // console.log('MOMO: ', result.data);
      payment_url = result.data.payUrl;
    } else if (paymentDetail.payment_method === 'payos') {
      const result = await this.paymentGatewayService.createPaymentLink_PayOS(
        payment_gateway_code,
        orderId,
        2000 + paymentDetail.payment_cashout_price / 1000,
        finalReturnUrl,
      );
      payment_url = result.checkoutUrl;
      // console.log('POS: ', result);
    }
    if (paymentDetail.payment_method === 'cod') {
      await this.transactionService.updateOrderWithPaymentGatewayInfo(
        orderId.toString(),
      );
    } else {
      await this.transactionService.updateOrderWithPaymentGatewayInfo(
        orderId.toString(),
        payment_gateway_code.toString(),
        payment_url,
      );
    }
    await this.transactionService.sendPaymentPendingEmail(email, orderId);
    return {
      checkoutUrl: payment_url,
    };
  }

  @Post('callback/momo')
  async momoCallback(@Body() body) {
    const orderId = body.extraData;
    // console.log('MOMO CALLBACK');
    await this.transactionService.updateOrderState(orderId, 'success');
    return { stt: 200 };
  }
  @Post('callback/payos')
  async payosCallback(@Req() req) {
    await this.paymentGatewayService.handlePayOSCallback(req);
  }
  @Post('callback/browser')
  async browserCancelOrder(@Body('orderId') orderId: string) {
    const order = await this.transactionService.getOrderDetail(orderId);
    if (!order) {
      throw new InternalServerErrorException(
        'Không tìm thấy đơn hàng tương ứng!',
      );
    }
    await this.transactionService.updateOrderState(orderId, 'failed');
    await this.paymentGatewayService.cancelOrder_PayOS(
      order?.payment_gateway_code,
    );
  }
  @Post('cancel-order/payos')
  async cancelOrderPayOS(@Body('orderId') orderId: string) {
    const order = await this.transactionService.getOrderDetail(orderId);
    if (!order) {
      throw new InternalServerErrorException(
        'Không tìm thấy đơn hàng tương ứng!',
      );
    }
    await this.paymentGatewayService.cancelOrder_PayOS(
      order?.payment_gateway_code,
    );
  }
  @Post('test-payment/momo')
  async testPaymentMomo() {
    const result = await this.paymentGatewayService.createPaymentLink_MOMO(
      'hi',
      'test',
      50000,
      'hi',
    );
    console.log(result.data);
    return result.data;
  }
  @Post('test-payment/payOS')
  async testPaymentPayOS() {
    const result = await this.paymentGatewayService.createPaymentLink_PayOS(
      500000,
      '500000',
      50000,
      'hi',
    );
    console.log(result.data);
    return result.data;
  }
}
@Controller('anonymous-transaction')
export class AnonymousTransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}
  @Post('transaction-detail')
  async getTransactionDetail(@Request() req, @Body('cartId') cartId: string) {
    if (!cartId) {
      throw new BadRequestException('No cart id provided!');
    }
    const ownerId = await this.cartService.getOwnerOfCart(cartId);
    if (ownerId) {
      throw new UnauthorizedException('Ẩn danh mà thọc ngoáy à');
    }
    const result =
      await this.transactionService.getTransactionInfoAndUpdateCart(cartId);
    return result;
  }

  @Post('confirm-transaction')
  async confirmTransaction(
    @Request() req,
    @Body('cartId') cartId: string,
    @Body('email') email: string,
    @Body('cartItemList') cartItemList: CartItemFe[],
    @Body('paymentDetail') paymentDetailFe: PaymentDetailFe,
    @Body('addressInfo') addressInfo: AddressInfoFe,
    @Body('redirectUrl') redirectUrl: string,
  ) {
    if (!cartId) throw new BadRequestException('Chưa cung cấp cartId');
    if (!redirectUrl) throw new BadRequestException('Chưa cung cấp URL trả về');
    if (!email) throw new BadRequestException('Chưa cung cấp email');

    const ownerId = await this.cartService.getOwnerOfCart(cartId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }

    const cart = await this.cartService.getCartDetail(cartId);
    //verify that body match that of db.
    const { itemListDetail, paymentDetail } =
      await this.transactionService.verifyTransactionDataFromFe(
        cart.cartId,
        cartItemList,
        paymentDetailFe,
      );

    //////TRANSACTION BLOCK ?????

    const session = await this.connection.startSession();
    let orderId = '';
    try {
      session.startTransaction();
      console.log('Data from fe: valid ');
      orderId = (
        await this.transactionService.createNewOrder(
          null,
          addressInfo,
          itemListDetail,
          paymentDetail,
          email,

          session,
        )
      ).toString();
      console.log('Order created for anonymous: ', '\nOrderId: ', orderId);
      const stockUpdatePromises =
        await this.transactionService.updateVariantStock(
          itemListDetail,
          session,
        );
      await Promise.all(stockUpdatePromises);
      console.log('Stock updated');
      // throw new Error();
      // user has a pending order
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      throw new InternalServerErrorException('Có lỗi khi tạo dữ liệu đơn hàng');
    } finally {
      await session.endSession();
    }

    //////TRANSACTION BLOCK ?????

    //create payment link
    let payment_url = '';
    let finalReturnUrl = redirectUrl + `?orderId1=${orderId}`;
    const payment_gateway_code = Math.floor(
      Math.pow(10, 10) + Math.random() * 8 * Math.pow(10, 10),
    );
    console.log('Code: ', payment_gateway_code);
    if (paymentDetail.payment_method === 'momo') {
      const result = await this.paymentGatewayService.createPaymentLink_MOMO(
        payment_gateway_code.toString(),
        orderId,
        2000 + paymentDetail.payment_cashout_price / 1000,
        finalReturnUrl,
      );
      // console.log('MOMO: ', result.data);
      payment_url = result.data.payUrl;
    } else if (paymentDetail.payment_method === 'payos') {
      const result = await this.paymentGatewayService.createPaymentLink_PayOS(
        payment_gateway_code,
        orderId,
        2000 + paymentDetail.payment_cashout_price / 1000,
        finalReturnUrl,
      );
      payment_url = result.checkoutUrl;
      // console.log('POS: ', result);
    }
    if (paymentDetail.payment_method === 'cod') {
      await this.transactionService.updateOrderWithPaymentGatewayInfo(
        orderId.toString(),
      );
    } else {
      await this.transactionService.updateOrderWithPaymentGatewayInfo(
        orderId.toString(),
        payment_gateway_code.toString(),
        payment_url,
      );
    }
    await this.transactionService.sendPaymentPendingEmail(email, orderId);
    return {
      checkoutUrl: payment_url,
    };
  }
}
