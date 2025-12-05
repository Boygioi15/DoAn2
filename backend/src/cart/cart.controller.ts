import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { AddNewItemDto, UpdateCartItemQuantityDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtGuard)
  @Get('cart-detail')
  async getCartDetail(@Request() req) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    const result = await this.cartService.getCartDetail(cart.cartId);
    return result;
  }
  @UseGuards(JwtGuard)
  @Post('add-item')
  async addItemToCart(@Request() req, @Body() addNewItem: AddNewItemDto) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    const result = await this.cartService.addNewItemToCart(
      cart.cartId,
      addNewItem,
    );
    return result;
  }
  @UseGuards(JwtGuard)
  @Patch('update-quantity')
  async updateCartItemQuantity(
    @Request() req,
    @Body() updateItemQuantity: UpdateCartItemQuantityDto,
  ) {
    const userId = req.user.userId;
    const ownerId = await this.cartService.getOwnerOfCartItem(
      updateItemQuantity.cartItemId,
    );
    if (userId !== ownerId) {
      throw new UnauthorizedException('Không phải hàng của bạn!');
    }
    const result = await this.cartService.updateCartItemQuantity(
      updateItemQuantity.cartItemId,
      updateItemQuantity.newQuantity,
    );
    return result;
  }
  @UseGuards(JwtGuard)
  @Patch('item/select/:cartItemId')
  async updateCartItemSelected(
    @Request() req,
    @Body('selected') selected: boolean,
    @Param('cartItemId') cartItemId: string,
  ) {
    const userId = req.user.userId;
    const ownerId = await this.cartService.getOwnerOfCartItem(cartItemId);
    if (userId !== ownerId) {
      throw new UnauthorizedException('Không phải hàng của bạn!');
    }
    const result = await this.cartService.updateCartItemSelected(
      cartItemId,
      selected,
    );
    return result;
  }
  @UseGuards(JwtGuard)
  @Patch('select')
  async updateCartSelected(
    @Request() req,
    @Body('selected') selected: boolean,
  ) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    const result = await this.cartService.updateCartSelectedOfUser(
      cart.cartId,
      selected,
    );
    return result;
  }
  @UseGuards(JwtGuard)
  @Delete('item/:cartItemId')
  async deleteCartItem(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
  ) {
    const userId = req.user.userId;
    const ownerId = await this.cartService.getOwnerOfCartItem(cartItemId);
    if (userId !== ownerId) {
      throw new UnauthorizedException('Không phải hàng của bạn!');
    }
    const result = await this.cartService.deleteCartItem(cartItemId);
    return result;
  }

  @UseGuards(JwtGuard)
  @Post('merge-with-anonymous')
  async mergeWithAnonymous(
    @Request() req,
    @Body('anonymousCartId') anonymousCartId: string,
  ) {
    const userId = req.user.userId;
    const cart = await this.cartService.createOrGetCartOfUser(userId);
    return this.cartService.mergeWithAnonymous(cart.cartId, anonymousCartId);
  }
}
@Controller('cart-anonymous/')
export class AnonymousCartController {
  constructor(private readonly cartService: CartService) {}
  @Post('cart-detail')
  async getCartDetail(@Body('cartId') cartId: string) {
    if (!cartId) {
      throw new BadRequestException('No cart id provided!');
    }
    const ownerId = await this.cartService.getOwnerOfCart(cartId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    const cart = await this.cartService.getCartDetail(cartId);
    return cart;
  }
  @Patch('update-quantity')
  async updateCartItemQuantity(
    @Body() updateItemQuantity: UpdateCartItemQuantityDto,
  ) {
    const ownerId = await this.cartService.getOwnerOfCartItem(
      updateItemQuantity.cartItemId,
    );
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    const result = await this.cartService.updateCartItemQuantity(
      updateItemQuantity.cartItemId,
      updateItemQuantity.newQuantity,
    );
    return result;
  }
  @Post('add-item')
  async addItemToCart(
    @Body() addNewItem: AddNewItemDto,
    @Body('cartId') cartId: string,
  ) {
    console.log('ANI: ', addNewItem);
    console.log('CI: ', cartId);
    if (cartId) {
      const ownerId = await this.cartService.getOwnerOfCart(cartId);
      if (ownerId) {
        throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
      }
    }

    let _cartId = cartId;
    if (!_cartId) {
      const cart: any = await this.cartService.createCartAnonymous();
      _cartId = cart.cartId;
    }
    const result = await this.cartService.addNewItemToCart(_cartId, addNewItem);
    return result;
  }
  @Patch('select')
  async updateCartSelected(
    @Body('selected') selected: boolean,
    @Body('cartId') cartId: string,
  ) {
    const ownerId = await this.cartService.getOwnerOfCart(cartId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    if (!cartId) {
      throw new BadRequestException('Không tồn tại cart id');
    }
    const result = await this.cartService.updateCartSelectedOfUser(
      cartId,
      selected,
    );
    return result;
  }
  @Patch('item/select/:cartItemId')
  async updateCartItemSelected(
    @Body('selected') selected: boolean,
    @Param('cartItemId') cartItemId: string,
  ) {
    const ownerId = await this.cartService.getOwnerOfCartItem(cartItemId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    const result = await this.cartService.updateCartItemSelected(
      cartItemId,
      selected,
    );
    return result;
  }
  @Delete('item/:cartItemId')
  async deleteCartItem(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
  ) {
    const ownerId = await this.cartService.getOwnerOfCartItem(cartItemId);
    if (ownerId) {
      throw new BadRequestException('Ẩn danh mà thọc ngoáy à');
    }
    const result = await this.cartService.deleteCartItem(cartItemId);
    return result;
  }
}
