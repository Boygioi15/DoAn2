import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AccountPasswordStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }
  async validate(account: string, password: string) {
    console.log('authenticate-user - Account&Password method');
    const user = await this.authService.verifyAccountPassword(
      account,
      password,
    );
    if (!user) {
      console.log(
        'authenticate-user - Account&Password method - invalid credential',
      );
      throw new ConflictException({
        stt: 409,
        msg: 'Tài khoản hoặc mật khẩu không đúng',
      });
    }
    console.log(
      'authenticate-user - Account&Password method - valid credential',
    );
    return user;
  }
}
export class AccountPasswordGuard extends AuthGuard('local') {}
