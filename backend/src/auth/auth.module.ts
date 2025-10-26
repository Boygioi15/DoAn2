import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { SmsServiceModule } from 'src/sms_service/sms_service.module';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { VerifyOtpStrategy } from './strategies/verifyOtp.strategy';
import { AccountPasswordStrategy } from './strategies/accountPassword.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    SmsServiceModule,
    UserModule,
    JwtModule.register({ global: true }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    VerifyOtpStrategy,
    AccountPasswordStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
