import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, Mongoose, ObjectId } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { CartItem, CartItemDocument } from 'src/database/schemas/cart.schema';
import { ProductQueryService } from 'src/product/services/product-query.service';
import { AddressInfoFe, CartItemFe, PaymentDetailFe } from './transaction.dto';
import { Order, OrderDetail } from 'src/database/schemas/transaction.schema';
import { User } from 'src/database/schemas/user.schema';
import { ProductInventoryService } from 'src/product/services/product-inventory.service';
import { ProductVariant } from 'src/database/schemas/product.schema';
import { PaymentGatewayService } from './payment-gateway.service';
import { order_ttl } from 'src/constants';
import { EmailService } from 'src/email/email.service';

type PaymentDetail = {
  payment_method: string;
  payment_default_price: number;
  payment_cashout_price: number;
};
@Injectable()
export class TransactionService {
  constructor(
    private cartService: CartService,
    private productQueryService: ProductQueryService,
    private productInventoryService: ProductInventoryService,
    private emailService: EmailService,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(CartItem.name)
    private cartItemModel: Model<CartItemDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(OrderDetail.name)
    private orderDetailModel: Model<OrderDetail>,
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
  ): Promise<{
    itemListDetail: CartItem[];
    paymentDetail: PaymentDetail;
  }> {
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
    return {
      itemListDetail: cartItemList,
      paymentDetail: {
        payment_method: paymentDetailFe.payment_method,
        payment_default_price: paymentDetailFe.payment_default_price,
        payment_cashout_price: paymentDetailFe.payment_cashout_price,
      },
    };
  }
  async createNewOrder(
    reference_user: string | null = null,
    addressInfo: AddressInfoFe,
    itemListDetail: CartItem[],
    paymentDetail: PaymentDetailFe,
    email: string,

    session: ClientSession,
  ) {
    const paymentChecked = paymentDetail.payment_method === 'cod';
    const [newOrderBasic] = await this.orderModel.create(
      [
        {
          address_name: addressInfo.address_name,
          address_phone: addressInfo.address_phone,
          address_province_code: addressInfo.address_province_code,
          address_province_name: addressInfo.address_province_name,
          address_district_code: addressInfo.address_district_code,
          address_district_name: addressInfo.address_district_name,
          address_ward_code: addressInfo.address_ward_code,
          address_ward_name: addressInfo.address_ward_name,
          address_detail: addressInfo.address_detail,

          payment_method: paymentDetail.payment_method,
          payment_default_price: paymentDetail.payment_default_price,
          payment_cashout_price: paymentDetail.payment_cashout_price,
          paymentChecked,

          reference_user,
          reference_address: addressInfo.reference_address,
          email,
        },
      ],
      { session },
    );
    console.log('Order basic: ', newOrderBasic);

    const orderDetailList = itemListDetail.map((item: CartItemDocument) => {
      const { _id, __v, ...rest } = item;

      return {
        ...rest,
        orderId: newOrderBasic._id,
      };
    });

    const newOrderDetails = await this.orderDetailModel.insertMany(
      orderDetailList,
      { session },
    );
    // console.log('Order detail list: ', newOrderDetails);
    return newOrderBasic._id;
  }
  async updateVariantStock(variantList: CartItem[], session: ClientSession) {
    return variantList.map(async (variant) => {
      return this.productInventoryService.takeAwayAmountOfVariantStock(
        variant.variantId,
        variant.quantity,
        session,
      );
    });
  }
  //update user pending
  async updateUserPending(
    userId: string,
    orderId: string,
    state: boolean,
    session: ClientSession,
  ) {
    const updated = await this.userModel.findOneAndUpdate(
      { userId, hasPendingOrder: null },
      { hasPendingOrder: orderId },
      { session, new: true },
    );

    if (!updated) {
      throw new BadRequestException('User already has pending order');
    }
  }
  ////integrating order with payment gateway
  async updateOrderWithPaymentGatewayInfo(
    orderId: string,
    payment_gateway_code?: string,
    payment_url?: string,
  ) {
    const newOrder = await this.orderModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(orderId),
      {
        payment_gateway_code,
        payment_url,
        payment_status: 'pending',
      },
      { new: true },
    );
    if (!newOrder) {
      throw new InternalServerErrorException(
        'Không thể cập nhật đơn hàng với thông tin cổng thanh toán',
      );
    }
    return newOrder;
  }

  async updateOrderState(orderId: string, state: string) {
    //finalize order state
    const checked = state === 'success';
    console.log('orderId: ', orderId);

    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, payment_status: { $ne: state } },
      {
        payment_status: state,
        payment_checked: checked,
      },
      { new: true },
    );
    if (!order) {
      throw new InternalServerErrorException(
        'Không tìm thấy đơn hàng tương ứng',
      );
    }

    console.log('Order ', orderId, ' updated to ', state);
    //update user pending
    if (order.reference_user) {
      const user = await this.userModel.findOneAndUpdate(
        {
          userId: order?.reference_user,
        },
        { hasPendingOrder: null },
      );
      console.log('Updated user pending of: ', order?.reference_user);
    }

    //email
    if (state === 'success') {
      this.sendOrderSuccessEmail(order.email, orderId);
    } else if (state === 'failed') {
      this.sendOrderFailedEmail(order.email, orderId);
    }
    //depend on the state, return the amount to the stock
    if (state === 'success') return;
    const variantIdAndStockList = await this.orderDetailModel
      .find({ orderId: new mongoose.Types.ObjectId(orderId) })
      .select('variantId quantity');
    const promises = variantIdAndStockList.map(async (variant) => {
      console.log('VI: ', variant);
      return await this.productInventoryService.returnAmountOfVariantStock(
        variant.variantId,
        variant.quantity,
      );
    });
    await Promise.all(promises);
    console.log('Return stock to variant ');
  }

  //finalize order
  async getOrderDetail(orderId: string) {
    return await this.orderModel.findById(orderId);
  }

  //cron job
  async findAndUpdateExpiredOrder() {
    const now = Date.now();
    const failedOrderList = await this.orderModel.find({
      payment_status: 'pending',
      payment_method: { $ne: 'cod' },
      createdAt: { $lt: new Date(now - order_ttl) },
    });
    const promises = failedOrderList.map(async (order) => {
      return await this.updateOrderState(order._id.toString(), 'failed');
    });
    await Promise.all(promises);
    // await this.orderModel.updateMany(
    //   {
    //     payment_status: 'pending',
    //     createdAt: { $lt: new Date(now - order_ttl) },
    //   },
    //   {
    //     $set: { payment_status: 'failed' },
    //   },
    // );
  }

  async sendPaymentPendingEmail(to: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new InternalServerErrorException(
        'Không tìm thấy chi tiết đơn hàng để gửi mail',
      );
    }
    await this.emailService.sendPaymentPendingEmail(to, order);
  }
  async sendOrderSuccessEmail(to: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    const orderDetailList = await this.orderDetailModel
      .find({
        orderId: new mongoose.Types.ObjectId(orderId),
      })
      .lean();
    if (!order || !orderDetailList) {
      throw new InternalServerErrorException(
        'Không tìm thấy chi tiết đơn hàng để gửi mail',
      );
    }
    await this.emailService.sendOrderSuccessEmail(to, order, orderDetailList);
  }
  async sendOrderFailedEmail(to: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new InternalServerErrorException(
        'Không tìm thấy chi tiết đơn hàng để gửi mail',
      );
    }
    await this.emailService.sendOrderFailedEmail(to, order);
  }
}
