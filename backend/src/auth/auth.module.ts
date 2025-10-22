import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { SmsServiceModule } from 'src/sms_service/sms_service.module';
import { SmsServiceService } from 'src/sms_service/sms_service.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    SmsServiceModule,
    UserModule,
    JwtModule.register({ global: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
