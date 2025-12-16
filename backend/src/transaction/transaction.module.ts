import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  AnonymousTransactionController,
  TransactionController,
} from './transaction.controller';
import { CartModule } from 'src/cart/cart.module';
import { ProductModule } from 'src/product/product.module';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentGatewayService } from './payment-gateway.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [TransactionController, AnonymousTransactionController],
  providers: [TransactionService, PaymentGatewayService],
  imports: [CartModule, ProductModule, DatabaseModule, EmailModule],
  exports: [TransactionService],
})
export class TransactionModule {}
