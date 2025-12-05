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
  canActivate(context: ExecutionContext) {
    // allow handleRequest() to catch passport errors
    return super.canActivate(context) as any;
  }

  handleRequest(err: any, user: any, info: any) {
    // info contains: JsonWebTokenError: jwt must be provided
    if (err || !user) {
      const message = info?.message || err?.message || 'Invalid token';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
