import { Module } from '@nestjs/common';
import { SmsServiceService } from './sms_service.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SmsServiceService],
  exports: [SmsServiceService],
})
export class SmsServiceModule {}
