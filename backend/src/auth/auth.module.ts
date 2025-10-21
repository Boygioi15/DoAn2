import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { SmsServiceModule } from 'src/sms_service/sms_service.module';
import { SmsServiceService } from 'src/sms_service/sms_service.service';

@Module({
  imports: [DatabaseModule, SmsServiceModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
