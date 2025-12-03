import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [DatabaseModule, ProductModule, UserModule],
})
export class CartModule {}
