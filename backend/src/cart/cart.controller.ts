import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { AddNewItemDto, UpdateCartItemDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @UseGuards(JwtGuard)
  @Get('cart-detail')
  async getCartDetail(@Request() req) {
    const userId = req.user.userId;
    const result = await this.cartService.getCartDetailOfUser(userId);
    return result;
  }
  @UseGuards(JwtGuard)
  @Post('add-item')
  async addItemToCart(@Request() req, @Body() addNewItem: AddNewItemDto) {
    const userId = req.user.userId;
    const result = await this.cartService.addNewItemToCart(userId, addNewItem);
    return result;
  }
  @UseGuards(JwtGuard)
  @Patch('update-quantity')
  async updateCartItemQuantity(
    @Request() req,
    @Body() updateItemQuantity: UpdateCartItemDto,
  ) {
    const userId = req.user.userId;
    const result = await this.cartService.updateCartItemQuantity(
      updateItemQuantity.cartItemId,
      updateItemQuantity.newQuantity,
    );
    return result;
  }
  @UseGuards(JwtGuard)
  @Delete('item/:cartItemId')
  async deleteCartItem(
    @Request() req,
    @Param('cartItemId') cartItemId: string,
  ) {
    const result = await this.cartService.deleteCartItem(cartItemId);
    return result;
  }
}
