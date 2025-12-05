import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { AnonymousCartController, CartController } from './cart.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [CartController, AnonymousCartController],
  providers: [CartService],
  imports: [DatabaseModule, ProductModule, UserModule],
})
export class CartModule {}
