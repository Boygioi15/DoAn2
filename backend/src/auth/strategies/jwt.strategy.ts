import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    console.log(secret);
    if (!secret) {
      throw new InternalServerErrorException(
        'JWT strategy configuration failed!',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  validate(payload: any) {
    console.log('hello in jwt strat validate');
    console.log('Jwt payload:', payload);
    return { userId: payload.sub };
  }
}
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      // info.message contains the reason from Passport-JWT (like "jwt expired")
      const message = info?.message || 'Token validation failed';
      throw new UnauthorizedException(`JWT Error: ${message}`);
    }
    return user;
  }
}
