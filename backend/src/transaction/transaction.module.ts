import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  AnonymousTransactionController,
  TransactionController,
} from './transaction.controller';
import { CartModule } from 'src/cart/cart.module';
import { ProductModule } from 'src/product/product.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [TransactionController, AnonymousTransactionController],
  providers: [TransactionService],
  imports: [CartModule, ProductModule, DatabaseModule],
})
export class TransactionModule {}
