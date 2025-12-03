import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { AddNewItemDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @UseGuards(JwtGuard)
  @Post('add-item')
  async addItemToCart(@Request() req, @Body() addNewItem: AddNewItemDto) {
    const userId = req.user.userId;
    const result = await this.cartService.addNewItemToCart(userId, addNewItem);
    return result;
  }
}
