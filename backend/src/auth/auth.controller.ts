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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Post('verify-otp-phone')
  async verifyOtp(@Body() { phone, otp }: { phone: string; otp: string }) {
    const found = await this.authService.verifyOtp(phone, otp);
    if (found) {
      return { stt: 200 };
    }
    throw new ConflictException({
      stt: 409,
      msg: 'OTP không đúng!',
    });
  }
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

  @Get('test-1')
  async test1() {
    const newObj = await this.authService.test1();
    console.log(newObj);
    return { msg: 'Auth test 1', newObj: newObj };
  }
  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
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
