import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConflictException,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/database/schemas/user.schema';
import { VerifyOtpGuard } from './strategies/verifyOtp.strategy';
import { AccountPasswordGuard } from './strategies/accountPassword.strategy';
import { JwtGuard } from './strategies/jwt.strategy';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { refreshToken_ttl } from 'src/constants';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('send-otp')
  async sendOtp(@Query('identifier') identifier: string) {
    //add case to separate between sending email and sms
    const phone = identifier;
    const cache = await this.authService.findIdentifierInOtp(phone);
    const SMSGateWayException = new InternalServerErrorException({
      stt: 504,
      msg: 'SMS server hiện không xài được. Vui lòng bật điện thoại lên trước',
    });
    const otp: string = Math.floor(1000 + Math.random() * 8000).toString();
    if (cache) {
      console.log('Send-otp-phone - exist in otp cache');

      const bounceback = cache.bounceback;
      const now = new Date(Date.now());
      if (now < bounceback) {
        console.log('Send-otp-phone - now < bounceback => not send OTP');
        throw new ConflictException({
          stt: 409,
          msg: ` OTP đã được gửi đến SĐT ${phone}, vui lòng đợi hết thời gian chờ trước khi gửi lại!`,
          bounceback,
        });
      }
      console.log(
        'Send-otp-phone - now >= bounceback => send OTP + update cache',
      );
      try {
        await this.HELPER_sendOtpPhone(phone, otp);
        const cache = await this.HELPER_updateCache(phone, otp);
        return { stt: 200, bounceback: cache.bounceback };
      } catch (error) {
        console.log(error);
        throw SMSGateWayException;
      }
    }
    console.log('Send-otp-phone - not exist in otp cache');
    try {
      await this.HELPER_sendOtpPhone(phone, otp);
      const cache = await this.HELPER_createCache(phone, otp);
      return { stt: 200, bounceback: cache.bounceback };
    } catch (error) {
      console.log(error);
      throw SMSGateWayException;
    }
  }

  ////SIGN UP BLOCK
  @Get('check-phone-sign-up-condition')
  async check_phone_sign_up_condition(@Query('phone') phone: string) {
    const phoneExist = await this.authService.checkPhoneRegistered(phone);
    if (!phoneExist) {
      return { stt: 200 };
    } else {
      throw new ConflictException({
        stt: 409,
        msg: 'Số điện thoại đã tồn tại!',
      });
    }
  }
  @Post('register-verify-otp-phone')
  async register_verifyOtp(
    @Body() { phone, otp }: { phone: string; otp: string },
  ) {
    const found = await this.authService.verifyOtp(phone, otp);
    if (found) {
      console.log('OTP verified successfully, create new user');
      const rt = await this.registerNewUser(phone);
      return rt;
    }
    throw new ConflictException({
      stt: 409,
      msg: 'OTP không đúng!',
    });
  }
  async registerNewUser(phone: string) {
    //create new user with user service
    const newUser = await this.userService.createNewUser();
    //create new login profile with userId
    const newLoginProfile = await this.authService.createNewLoginProfile(
      newUser.userId,
      'phone',
      phone,
    );
    const rt = await this.HELPER_JWT(newUser.userId);
    return rt;
  }
  @Get('check-phone-sign-in-condition')
  async check_phone_sign_in_condition(@Query('phone') phone: string) {
    const phoneExistInLoginProfile =
      await this.authService.checkPhoneRegistered(phone);
    if (phoneExistInLoginProfile) {
      return { stt: 200 };
    }
    throw new ConflictException({
      stt: HttpStatus.CONFLICT,
      msg: 'Không tồn tại số điện thoại trong CSDL!',
    });
  }

  @Post('authenticate-user/otp')
  @UseGuards(VerifyOtpGuard)
  async authenticateUSer_otp(@Request() req) {
    //find associated user with phone
    const user = req.user;
    const rt = await this.HELPER_JWT(user);
    return rt;
  }
  @Post('authenticate-user/account-password')
  @UseGuards(AccountPasswordGuard)
  async authenticateUSer_accountPassword(@Request() req) {
    //find associated user with phone
    const user = req.user;
    const rt = await this.HELPER_JWT(user);
    return rt;
  }

  @Post('/update-password')
  @UseGuards(JwtGuard)
  async updateUserPassword(
    @Request() req,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    const user = req.user;
    const userId = user.userId;
    const { oldPassword, newPassword, confirmNewPassword } = updatePassword;

    if (!(confirmNewPassword === newPassword)) {
      throw new BadRequestException({
        stt: 400,
        msg: 'Mật khẩu mới và xác nhận mật khẩu mới không khớp!',
      });
    }
    try {
      await this.authService.updateUserPassword(userId, updatePassword);
    } catch (error) {
      throw error;
    }
  }
  @Post('refresh-access-token')
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    //verify if rt is valid
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        'Missing JWT_REFRESH_SECRET in .env',
      );
    }
    //return new AT with associated userID
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: secret });
      console.log('Refresh-access-token: ', refreshToken);
      console.log('Refresh payload: ', payload);
      const accessToken = await this.authService.getNewAccessToken(
        payload.sub,
        refreshToken,
      );
      console.log('New access token: ', accessToken);
      return { stt: 200, accessToken };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid refresh token!');
    }
  }
  @Post('sign-out')
  async signOut(@Body('refreshToken') refreshToken: string) {
    //verify if rt is valid
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        'Missing JWT_REFRESH_SECRET in .env',
      );
    }
    //return new AT with associated userID
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: secret });
      console.log('Refresh-access-token: ', refreshToken);
      console.log('Refresh payload: ', payload);
      await this.authService.signOut(payload.sub, refreshToken);
      return { stt: 200 };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error while deleting refresh token',
      );
    }
  }
  ////HELPER BLOCK
  async HELPER_JWT(userId: string) {
    const accessToken = await this.authService.signAccessToken(userId);
    console.log('authenticate-user - access token signed: ', accessToken);
    const refreshToken = await this.authService.signRefreshToken(userId);
    console.log('authenticate-user - refresh token signed: ', refreshToken);

    const cache = await this.authService.createRefreshTokenCache(
      userId,
      refreshToken,
    );
    console.log('authenticate-user - refresh token cached: ', cache);
    //register rt in db.
    //send AT, RT back
    return { accessToken, refreshToken, stt: 200 };
  }
  async HELPER_sendOtpPhone(phone: string, otp: string) {
    console.log('Send-otp-phone - ptp:', otp);
    //await this.authService.sendOtp(phone, otp);
    console.log('Send-otp-phone - otp sent');
  }
  async HELPER_createCache(identifier: string, otp: string) {
    const newCache = await this.authService.createOtpCache(identifier, otp);
    console.log('Send-otp-identifier - cache created, cache:');
    console.log(newCache);
    return newCache;
  }
  async HELPER_updateCache(identifier: string, otp: string) {
    const newCache = await this.authService.updateOtpCache(identifier, otp);
    console.log('Send-otp-identifier - cache updated, cache:');
    console.log(newCache);
    return newCache;
  }

  @Get('test-1')
  async test1() {
    const newObj = await this.authService.test1();
    console.log(newObj);
    return { msg: 'Auth test 1', newObj: newObj };
  }
}
