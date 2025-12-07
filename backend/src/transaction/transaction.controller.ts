import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { CartService } from 'src/cart/cart.service';
import { AddressInfoFe, CartItemFe, PaymentDetailFe } from './transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly cartService: CartService,
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
    @Body('cartItemList') cartItemList: CartItemFe[],
    @Body('paymentDetail') paymentDetail: PaymentDetailFe,
    @Body('addressInfo') addressInfo: AddressInfoFe,
  ) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    const valid = await this.transactionService.verifyTransactionDataFromFe(
      cart.cartId,
      cartItemList,
      paymentDetail,
    );
    console.log('Valid: ', valid);
    //verify that body match that of db.
  }
}
@Controller('anonymous-transaction')
export class AnonymousTransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly cartService: CartService,
  ) {}
  @Post('transaction-detail')
  async getTransactionDetail(@Request() req, @Body('cartId') cartId: string) {
    if (!cartId) {
      throw new BadRequestException('No cart id provided!');
    }
    const ownerId = await this.cartService.getOwnerOfCart(cartId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    const result =
      await this.transactionService.getTransactionInfoAndUpdateCart(cartId);
    return result;
  }
}
