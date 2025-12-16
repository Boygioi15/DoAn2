import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartItem } from 'src/database/schemas/cart.schema';
import { ProductService } from 'src/product/services/product.service';
import { UserService } from 'src/user/user.service';
import { AddNewItemDto } from './cart.dto';
import { ProductQueryService } from 'src/product/services/product-query.service';

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
  async getCartDetail(cartId: string) {
    const cartBasic = await this.getCartBasic(cartId);

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
      allowedToPurchase: cartBasic.allowedToPurchase,
      allSelected: cartBasic.allSelected,
      totalSelected: cartBasic.totalSelected,
      userId: cartBasic.userId,
    };
  }
  async getCartBasic(cartId: string) {
    const cartBasic = await this.cartModel.findOne({ cartId });
    if (!cartBasic) {
      throw new InternalServerErrorException(
        'Không tồn tại giỏ hàng tương ứng!',
      );
    }
    return cartBasic;
  }
  //basic block

  async createOrGetCartOfUser(userId: string) {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      //create cart for user
      cart = await this.cartModel.create({ userId });
      console.log('Cart not found, create new cart: ', cart.cartId);
    } else {
      console.log('Cart found, cart ID: ', cart.cartId);
    }
    return cart;
  }
  async createCartAnonymous() {
    const cart = await this.cartModel.create({});
    if (!cart) {
      throw new InternalServerErrorException('Error when create cart!');
    }
    return cart;
  }
  async addNewItemToCart(cartId: string, addNewItem: AddNewItemDto) {
    // //also user check
    // const user = await this.userService.getUserInfo(userId);
    // console.log('User found: ', user);
    // //get cart of user
    let cart = await this.getCartBasic(cartId);

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
        product_sku: productInfo.sku,
        product_name,
        product_thumbnail,
        variant_color,
        variant_size,
        variant_thumbnail,
        variant_sku: variantInfo.platform_sku,
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
    let newCartItem = await this.cartItemModel.findOneAndUpdate(
      { cartItemId },
      { quantity: newQuantity, cashoutPrice: newQuantity * cartItem.unitPrice },
      { new: true },
    );
    if (!newCartItem) {
      throw new InternalServerErrorException('Có lỗi khi cập nhật sản phẩm!');
    }
    if (newCartItem?.invalidState !== 'normal') {
      newCartItem =
        await this.verifyAndUpdateCartItemForTransaction(newCartItem);
    }
    await this.denormalizeCart(cartItem.cartId);
    return newCartItem;
  }

  async updateCartSelectedOfUser(cartId: string, selected: boolean) {
    const cart = await this.getCartBasic(cartId);
    const cartItem = await this.cartItemModel.updateMany(
      {
        cartId: cart.cartId,
      },
      { selected: selected },
    );
    await this.denormalizeCart(cart.cartId);
    return cartItem;
  }
  async updateCartItemSelected(cartItemId: string, selected: boolean) {
    const cartItem = await this.cartItemModel.findOneAndUpdate(
      { cartItemId },
      { selected: selected },
      { new: true },
    );
    if (!cartItem) {
      throw new InternalServerErrorException(
        'Không tồn tại sản phẩm tương ứng trong giỏ hàng!',
      );
    }
    await this.denormalizeCart(cartItem.cartId);
    return cartItem;
  }
  async deleteCartItem(cartItemId: string) {
    const deletedCart = await this.cartItemModel.findOneAndDelete({
      cartItemId,
    });
    if (!deletedCart) {
      throw new InternalServerErrorException(
        'Không tồn tại sản phẩm tương ứng trong giỏ',
      );
    }
    await this.denormalizeCart(deletedCart.cartId);
    return deletedCart;
  }
  async getOwnerOfCartItem(cartItemId: string) {
    const cartItem = await this.cartItemModel.findOne({
      cartItemId,
    });
    if (!cartItem) {
      throw new InternalServerErrorException(
        'Không tìm thấy sản phẩm tương ứng',
      );
    }
    const cart = await this.cartModel.findOne({ cartId: cartItem.cartId });
    return cart?.userId;
  }
  async getOwnerOfCart(cartId: string) {
    const cart = await this.cartModel.findOne({ cartId });
    return cart?.userId;
  }
  async denormalizeCart(cartId: string) {
    const cartItemList = await this.cartItemModel.find({ cartId });

    const allQuantity = cartItemList.map((cartItem) =>
      cartItem.selected ? cartItem.quantity : 0,
    );
    const allPrice = cartItemList.map((cartItem) =>
      cartItem.selected ? cartItem.cashoutPrice : 0,
    );

    let totalItem = 0;
    let cashoutPrice = 0;

    let allowedToPurchase = true;
    let allSelected = true;
    let totalSelected = 0;

    //price related
    totalItem = allQuantity.reduce((acc, cur) => acc + cur, 0);
    cashoutPrice = allPrice.reduce((acc, cur) => acc + cur, 0);

    //select related
    for (const cartItem of cartItemList) {
      if (cartItem.quantity > cartItem.maxAllowedQuantity) {
        if (cartItem.selected) {
          allowedToPurchase = false;
        }
      }
      if (!cartItem.selected) {
        allSelected = false;
      } else {
        totalSelected++;
      }
    }
    if (totalSelected === 0) {
      allowedToPurchase = false;
    }
    const newCart = await this.cartModel.findOneAndUpdate(
      { cartId },
      {
        totalItem: totalItem,
        defaultPrice: cashoutPrice,
        cashoutPrice,
        allowedToPurchase,
        allSelected,
        totalSelected,
      },
      { new: true },
    );
    console.log('Cart denormalized: ', newCart);
    return newCart;
  }

  async mergeWithAnonymous(cartId: string, anonymousCartId: string) {
    console.log('CI: ', cartId, 'ACI: ', anonymousCartId);
    const userCartItemList = await this.cartItemModel.find({ cartId });
    const anonymousCartItemList = await this.cartItemModel.find({
      cartId: anonymousCartId,
    });
    const mergePromises = anonymousCartItemList.map(async (item) => {
      const matching = userCartItemList.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variantId === item.variantId,
      );
      if (matching) {
        return this.updateCartItemQuantity(
          matching.cartItemId,
          matching.quantity + item.quantity,
        );
      } else {
        return this.cartItemModel.create({
          cartId,
          maxAllowedQuantity: item.maxAllowedQuantity,
          productId: item.productId,
          variantId: item.variantId,
          product_name: item.product_name,
          product_thumbnail: item.product_thumbnail,
          variant_color: item.variant_color,
          variant_size: item.variant_size,
          variant_thumbnail: item.variant_thumbnail,
          unitPrice: item.unitPrice,
          cashoutPrice: item.cashoutPrice,
        });
      }
    });
    const result = await Promise.all(mergePromises);
  }

  //transaction block
  //end result: cart updated to match latest
  async updateCartToMatchLatest(cartId: string) {
    const cartDetail = await this.getCartDetail(cartId);
    const cartItemList = cartDetail.cartItemList;
    const updatedList: any = [];
    await Promise.all(
      cartItemList.map(async (cartItem) => {
        let isUpdated = false;
        let item = { ...cartItem };
        const { product, variant } =
          await this.productQueryService.checkAndGetIfProductAndVariantExisted(
            cartItem.productId,
            cartItem.variantId,
          );
        //comparison
        if (
          item.product_name !== product.name ||
          item.product_thumbnail !== product.thumbnailURL ||
          item.variant_color !== variant.optionValue1 ||
          item.variant_size !== variant.optionValue2 ||
          item.unitPrice !== variant.price
        ) {
          isUpdated = true;
          updatedList.push(cartItem.cartItemId);
        }
        // console.log('I: ', item);
        // console.log('P: ', product);
        // console.log('V: ', variant);
        //info

        //replace regardless
        const newCartItem = await this.cartItemModel.findOneAndUpdate(
          { cartItemId: cartItem.cartItemId },
          {
            maxAllowedQuantity: variant.stock,
            productId: product.productId,
            variantId: variant.variantId,
            product_name: product.name,
            product_thumbnail: product.thumbnailURL,
            variant_color: variant.optionValue1,
            variant_size: variant.optionValue2,
            variant_thumbnail: variant.optionImage1[0],
            unitPrice: variant.price,
            cashoutPrice: variant.price * cartItem.quantity,
            isUpdated,
          },
          { new: true },
        );
        // console.log('New item: ', newCartItem);
      }),
    );
    await this.denormalizeCart(cartId);
    return updatedList;
  }
  //return array of invalid stuff
  async verifyAndUpdateCartForTransaction(cartId: string) {
    const cartDetail = await this.getCartDetail(cartId);
    await Promise.all(
      cartDetail.cartItemList.map(
        async (item) => await this.verifyAndUpdateCartItemForTransaction(item),
      ),
    );
    return true;
  }
  //helper
  async verifyAndUpdateCartItemForTransaction(cartItem: any) {
    let invalidState = 'normal';
    try {
      const { product, variant } =
        await this.productQueryService.checkAndGetIfProductAndVariantExisted(
          cartItem.productId,
          cartItem.variantId,
        );
      if (
        !product.isPublised ||
        product.isDrafted ||
        product.isDeleted ||
        !variant.isOpenToSale
      ) {
        invalidState = 'invalid';
      } else if (variant.stock === 0) {
        invalidState = 'outOfStock';
      } else if (cartItem.quantity > cartItem.maxAllowedQuantity) {
        invalidState = 'overflow';
      }
    } catch (error) {
      invalidState = 'invalid';
    } finally {
      const newCartItem = await this.cartItemModel.findOneAndUpdate(
        { cartItemId: cartItem.cartItemId },
        { invalidState },
      );
      // console.log('IS: ', invalidState);
      return newCartItem;
    }
  }
}
