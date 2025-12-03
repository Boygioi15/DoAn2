import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem } from 'src/database/schemas/cart.schema';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { AddNewItemDto } from './cart.dto';
import { ProductQueryService } from 'src/product/product-query.service';

@Injectable()
export class CartService {
  constructor(
    private productQueryService: ProductQueryService,
    private userService: UserService,
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,
    @InjectModel(CartItem.name)
    private cartItemModel: Model<CartItem>,
  ) {}
  async getCartOfUser(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new InternalServerErrorException('Không ');
    }
    return cart;
  }
  async addNewItemToCart(userId: string, addNewItem: AddNewItemDto) {
    //also user check
    const user = await this.userService.getUserInfo(userId);
    //get cart of user
    const cart = await this.getCartOfUser(userId);

    const { productId, variantId } = addNewItem;
    //product check
    const productInfo =
      await this.productQueryService.getProductDetail_Admin(productId);
    console.log('PI: ', productInfo);
    const variantInfo = productInfo.variantSellingPoint.find(
      (variant) => variant.variantId === variantId,
    );
    if (!variantInfo) {
      throw new InternalServerErrorException(
        'không tìm thấy biến thể tương ứng!',
      );
    }
    if (
      !productInfo.isPublised ||
      productInfo.isDrafted ||
      productInfo.isDeleted ||
      !variantInfo.isOpenToSale
    ) {
      throw new InternalServerErrorException('Sản phẩm không phù hợp ');
    }
    const { name: product_name, thumbnailURL: product_thumbnail } = productInfo;
    const { optionValue1: variant_name, optionValu2: variant_color } =
      variantInfo;
    const variant_thumbnail = variantInfo.optionImage1[0];
    const existed = await this.cartItemModel.findOne({
      productId,
      variantId: variantId,
      cartId: cart.cartId,
    });
    if (existed) {
      const newCartItem = await this.updateCartItemQuantity(
        existed.cartItemId,
        existed.quantity + 1,
      );
    } else {
      const newCartItem = await this.cartItemModel.create({
        userId: userId,
      });
    }
  }
  async updateCartItemQuantity(cartItemId: string, newQuantity: number) {
    const cartItem = await this.cartItemModel.findOne({ cartItemId });
    if (!cartItem) {
      throw new InternalServerErrorException(
        'Không tồn tại sản phẩm tương ứng trong giỏ hàng!',
      );
    }
    //check totalStock
    if (newQuantity <= 0) {
      throw new InternalServerErrorException('Số lượng không hợp lệ!');
    }
    if (newQuantity > cartItem.maxAllowedQuantity) {
      newQuantity = cartItem.maxAllowedQuantity;
    }
    const newCartItem = await this.cartItemModel.findOneAndUpdate(
      { cartItemId },
      { quantity: newQuantity },
    );
    return newCartItem;
  }
  async denormalizeCart(cartId: string) {}
}
