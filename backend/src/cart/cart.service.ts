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
  async getCartDetailOfUser(userId: string) {
    const cartBasic = await this.getCartOfUser(userId);
    let cartItemList = await this.cartItemModel
      .find({
        cartId: cartBasic.cartId,
      })
      .lean();
    return {
      cartId: cartBasic.cartId,
      totalItem: cartBasic.totalItem,
      cashoutPrice: cartBasic.cashoutPrice,
      cartItemList: cartItemList,
    };
  }
  //basic block
  async getCartOfUser(userId: string) {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      //create cart for user
      cart = await this.createCartForUser(userId);
      console.log('Cart not found, create new cart: ', cart.cartId);
    } else {
      console.log('Cart found, cart ID: ', cart.cartId);
    }
    return cart;
  }
  async createCartForUser(userId: string) {
    const cart = await this.cartModel.create({ userId });
    if (!cart) {
      throw new InternalServerErrorException('Error when create cart!');
    }
    return cart;
  }
  async addNewItemToCart(userId: string, addNewItem: AddNewItemDto) {
    //also user check
    const user = await this.userService.getUserInfo(userId);
    console.log('User found: ', user);
    //get cart of user
    let cart = await this.getCartOfUser(userId);

    const { productId, variantId } = addNewItem;
    //product check
    const productInfo =
      await this.productQueryService.getProductDetail_Admin(productId);
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
    console.log('Allowed to add to carts: ');

    const { name: product_name, thumbnailURL: product_thumbnail } = productInfo;
    const { optionValue1: variant_color, optionValue2: variant_size } =
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
      console.log('Cart item existed, new item: ', newCartItem);
      return newCartItem;
    } else {
      const newCartItem = await this.cartItemModel.create({
        cartId: cart.cartId,
        maxAllowedQuantity: variantInfo.stock,
        productId: productInfo.productId,
        variantId: variantInfo.variantId,
        product_name,
        product_thumbnail,
        variant_color,
        variant_size,
        variant_thumbnail,
        unitPrice: variantInfo.price,
        cashoutPrice: variantInfo.price,
      });

      console.log('Cart item not existed, new item: ', newCartItem);
      await this.denormalizeCart(cart.cartId);
      return newCartItem;
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
      { quantity: newQuantity, cashoutPrice: newQuantity * cartItem.unitPrice },
      { new: true },
    );
    await this.denormalizeCart(cartItem.cartId);
    return newCartItem;
  }
  async deleteCartItem(cartItemId: string) {
    const deletedCart = await this.cartModel.findOneAndDelete({ cartItemId });
    if (!deletedCart) {
      throw new InternalServerErrorException(
        'Không tồn tại sản phẩm tương ứng trong giỏ',
      );
    }
    await this.denormalizeCart(deletedCart.cartId);
    return deletedCart;
  }
  async denormalizeCart(cartId: string) {
    const allCartItems = await this.cartItemModel.find({ cartId });
    const allQuantity = allCartItems.map((cart) => cart.quantity);
    const allPrice = allCartItems.map((cart) => cart.cashoutPrice);
    let totalItem = 0;
    let cashoutPrice = 0;
    totalItem = allQuantity.reduce((acc, cur) => acc + cur, 0);
    cashoutPrice = allPrice.reduce((acc, cur) => acc + cur, 0);
    const newCart = await this.cartModel.findOneAndUpdate(
      { cartId },
      {
        totalItem: totalItem,
        defaultPrice: cashoutPrice,
        cashoutPrice,
      },
      { new: true },
    );
    console.log('Cart denormalized: ', newCart);
    return newCart;
  }
}
