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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticateUserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('send-otp-phone')
  async sendOtp(@Query('phone') phone: string) {
    const cache = await this.authService.findPhoneInOtp(phone);
    const SMSGateWayException = new HttpException(
      'SMS server hiện không xài được. Vui lòng bật điện thoại lên trước',
      HttpStatus.GATEWAY_TIMEOUT,
    );
    const otp: string = Math.floor(100000 + Math.random() * 800000).toString();
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
        await this.HELPER_sendOtp(phone, otp);
        const cache = await this.HELPER_updateCache(phone, otp);
        return { stt: 200, bounceback: cache.bounceback };
      } catch (error) {
        console.log(error);
        throw SMSGateWayException;
      }
    }
    console.log('Send-otp-phone - not exist in otp cache');
    try {
      await this.HELPER_sendOtp(phone, otp);
      const cache = await this.HELPER_createCache(phone, otp);
      return { stt: 200, bounceback: cache.bounceback };
    } catch (error) {
      console.log(error);
      throw SMSGateWayException;
    }
  }

  ////SIGN UP BLOCK
  @Get('check-phone-sign-up-condition')
  check_phone_sign_up_condition(@Query('phone') phone: string) {
    const phoneExist = this.authService.checkPhoneRegistered(phone);
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
      this.registerNewUser(phone);
      return { stt: 200 };
    }
    throw new ConflictException({
      stt: 409,
      msg: 'OTP không đúng!',
    });
  }
  async registerNewUser(phone: string) {
    //create new user with user service
    const newUser = await this.userService.createNewUser(phone);
    //create new login profile with userId
    const newLoginProfile = await this.authService.createNewLoginProfile(
      newUser.userId,
      'phone',
      phone,
    );
    //JWT system
    //return a JWT
  }
  @Get('check-phone-sign-in-condition')
  async check_phone_sign_in_condition(@Query('phone') phone: string) {
    console.log('HI');
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
  @Post('authenticate-user')
  async authenticateUser(@Body() authenticateUser: AuthenticateUserDto) {
    const method = authenticateUser.method;
    switch (method) {
      case 'SMS':
        console.log('authenticate-user - SMS method');
        const phone = authenticateUser.phone;
        const otp = authenticateUser.otp;
        if (!phone || !otp) {
          throw new BadRequestException('Request không hợp lệ!');
        }
        const validOtp = await this.authService.verifyOtp(phone, otp);
        if (!validOtp) {
          console.log('authenticate-user - SMS method - invalid OTP');
          throw new UnauthorizedException('Otp không đúng!');
        }
        console.log('authenticate-user - SMS method - valid OTP');
        //find associated user with phone
        const user = await this.authService.findUserWithPhone(phone);
        console.log('authenticate-user - user: ', user);
        if (!user) {
          throw new InternalServerErrorException();
        }
        const accessToken = await this.authService.signAccessToken(user);
        console.log('authenticate-user - access token signed: ', accessToken);
        const refreshToken = await this.authService.signRefreshToken(user);
        console.log('authenticate-user - refresh token signed: ', refreshToken);

        const cache = await this.authService.createRefreshTokenCache(
          user.userId,
          refreshToken,
        );
        console.log('authenticate-user - refresh token cached: ', cache);
        //register rt in db.
        //send AT, RT back
        return { accessToken, refreshToken, stt: 200 };
        break;
      //verify otp here
      case 'account':
        const account = authenticateUser.account;
        const password = authenticateUser.password;
        if (!account || !password) {
          throw new BadRequestException('Request không hợp lệ!');
        }
    }
  }
  @Post('refresh-access-token')
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {}
  ////HELPER BLOCK
  async HELPER_sendOtp(phone: string, otp: string) {
    console.log('Send-otp-phone - ptp:', otp);
    //await this.authService.sendOtp(phone, otp);

    console.log('Send-otp-phone - otp sent');
  }
  async HELPER_createCache(phone: string, otp: string) {
    const newCache = await this.authService.createOtpCache(phone, otp);
    console.log('Send-otp-phone - cache created, cache:');
    console.log(newCache);
    return newCache;
  }
  async HELPER_updateCache(phone: string, otp: string) {
    const newCache = await this.authService.updateOtpCache(phone, otp);
    console.log('Send-otp-phone - cache updated, cache:');
    console.log(newCache);
    return newCache;
  }
  HELPER_hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(Number(process.env.BCRYPT_SALT_ROUN));
    const hashed = bcrypt.hashSync(password, salt);
    return hashed;
  }
  HELPER_compareHashedPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
  @Get('test-1')
  async test1() {
    const newObj = await this.authService.test1();
    console.log(newObj);
    return { msg: 'Auth test 1', newObj: newObj };
  }
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
