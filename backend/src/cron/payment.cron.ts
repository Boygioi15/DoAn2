import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class PaymentCron {
  constructor(private readonly transactionService: TransactionService) {}

  @Cron('*/1 * * * *')
  async handlePaymentCron() {
    console.log('Payment cron');
    await this.transactionService.findAndUpdateExpiredOrder();
  }
  //   @Cron('* * * * *')
  //   test() {
  //     console.log('test cron');
  //   }
}
