import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { CartItem, CartItemDocument } from 'src/database/schemas/cart.schema';
import { ProductQueryService } from 'src/product/product-query.service';
import { CartItemFe, PaymentDetailFe } from './transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    private cartService: CartService,
    private productQueryService: ProductQueryService,
    @InjectModel(CartItem.name)
    private cartItemModel: Model<CartItemDocument>,
  ) {}
  async getTransactionInfoAndUpdateCart(cartId: string) {
    await this.cartService.updateCartToMatchLatest(cartId);
    await this.cartService.verifyAndUpdateCartForTransaction(cartId);
    const { cartItemList, defaultAmount, cashoutAmount } =
      await this.getCartTransactionDetail(cartId);

    return {
      cartItemList,
      defaultAmount,
      cashoutAmount,
    };
  }

  async getCartTransactionDetail(cartId: string) {
    const cartDetail = await this.cartService.getCartDetail(cartId);
    let cartItemList = cartDetail.cartItemList.filter(
      (cartItem) => cartItem.selected,
    );
    let defaultAmount = 0;
    let cashoutAmount = 0;
    for (const cartItem of cartItemList) {
      defaultAmount += cartItem.quantity * cartItem.unitPrice;
    }
    cashoutAmount = defaultAmount;
    return {
      defaultAmount,
      cashoutAmount,
      cartItemList,
    };
  }

  async verifyTransactionDataFromFe(
    cartId: string,
    cartItemListFe: CartItemFe[],
    paymentDetailFe: PaymentDetailFe,
  ) {
    //cart item list
    await this.cartService.verifyAndUpdateCartForTransaction(cartId);
    const { cartItemList, defaultAmount, cashoutAmount } =
      await this.getCartTransactionDetail(cartId);
    for (const cartItem of cartItemList) {
      if (!cartItem.selected) continue;
      if (cartItem.invalidState !== 'normal') {
        throw new BadRequestException(
          'Sản phẩm không hợp lệ!' + cartItem.cartItemId,
        );
      } else if (cartItem.isUpdated) {
        throw new BadRequestException('Sản phẩm có sự cập nhật');
      }
    }
    for (const cartItem of cartItemList) {
      const exist = cartItemListFe.find(
        (cartItemFe) => cartItemFe.cartItemId === cartItem.cartItemId,
      );
      if (!exist) {
        console.log('be: ', cartItem);
        console.log('fe: ', exist);
        throw new BadRequestException(
          'Giỏ hàng ở máy chủ và người dùng có sự khác biệt: Sản phẩm ' +
            cartItem +
            ' có ở máy chủ, còn người dùng thì không',
        );
      }
    }
    for (const cartItem of cartItemListFe) {
      const exist = cartItemList.find(
        (cartItem) => cartItem.cartItemId === cartItem.cartItemId,
      );
      if (!exist) {
        console.log('Fe: ', cartItem);
        console.log('be: ', exist);

        throw new BadRequestException(
          'Giỏ hàng ở máy chủ và người dùng có sự khác biệt: Sản phẩm ' +
            cartItem +
            ' có ở người dùng, còn máy chủ thì không',
        );
      }
    }
    for (const cartItemFe of cartItemListFe) {
      const cartItemBe = cartItemList.find(
        (cartItem) => cartItem.cartItemId === cartItemFe.cartItemId,
      );
      const changedFields = Object.keys(cartItemFe).filter(
        (key) => cartItemFe[key] !== cartItemBe?.[key],
      );

      if (changedFields.length > 0) {
        throw new BadRequestException(
          'Sản phẩm ' +
            cartItemFe +
            ' có sự khác biệt với máy chủ: ' +
            cartItemBe,
        );
      }
    }
    console.log('BE payment amount: ');
    console.log('CA: ', cashoutAmount);
    console.log('DA: ', defaultAmount);
    if (
      paymentDetailFe.payment_cashout_price !== cashoutAmount ||
      paymentDetailFe.payment_default_price !== defaultAmount
    ) {
      throw new BadRequestException('Chi tiết giao dịch không đúng!');
    }
  }
}
