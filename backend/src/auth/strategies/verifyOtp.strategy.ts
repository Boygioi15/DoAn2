import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class VerifyOtpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identifier',
      passwordField: 'otp',
    });
  }
  async validate(identifier: string, otp: string) {
    console.log('authenticate-user - SMS method');
    const match = await this.authService.verifyOtp(identifier, otp);
    if (!match) {
      console.log('authenticate-user - SMS method - otp not matched');
      throw new ConflictException({ stt: 409, msg: 'OTP không đúng' });
    }
    console.log('authenticate-user - SMS method - otp matched');
    const user = await this.authService.findUserWithIdentifier(identifier);
    return user;
  }
}
export class VerifyOtpGuard extends AuthGuard('local') {}
