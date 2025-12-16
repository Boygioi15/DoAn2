import { Module } from '@nestjs/common';
import { PaymentCron } from './payment.cron';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  providers: [PaymentCron],
  imports: [TransactionModule],
})
export class CronModule {}
