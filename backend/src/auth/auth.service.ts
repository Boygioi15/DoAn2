import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserLoginProfile,
  UserLoginProfileDocument,
} from 'src/database/schemas/user_login_profile.schema';
import { Model } from 'mongoose';
import {
  UserOtpCache,
  UserOtpCacheDocument,
} from 'src/database/schemas/user_otp_cache.schema';
import { auth_provider } from '../constants';
import { SmsServiceService } from 'src/sms_service/sms_service.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsServiceService,

    @InjectModel(UserLoginProfile.name)
    private userLoginProfileModel: Model<UserLoginProfileDocument>,
    @InjectModel(UserOtpCache.name)
    private userOtpCacheModel: Model<UserOtpCacheDocument>,
  ) {}
  checkPhoneRegistered(phone: string) {
    const phoneExist = !!this.userLoginProfileModel.findOne({
      provider: auth_provider.phone,
      identifier: phone,
    });
    return phoneExist;
  }
  findPhoneInOtp(phone: string) {
    const phoneExist = this.userOtpCacheModel.findOne({ phone: phone });
    return phoneExist;
  }
  async createOtpCache(phone: string, otp: string) {
    const bouncebackDate = new Date(
      Date.now() + Number(process.env.OTP_BOUNCEBACK) * 1000,
    );
    //console.log(Number(process.env.OTP_BOUNCEBACK));
    const ttlDate = new Date(Date.now() + Number(process.env.OTP_TTL) * 1000);
    console.log(bouncebackDate, ttlDate);
    const newCache = await this.userOtpCacheModel.create({
      phone: phone,
      otp: otp,
      bounceback: bouncebackDate,
      ttl: ttlDate,
    });
    return newCache;
  }
  async updateOtpCache(phone: string, otp: string) {
    const bouncebackDate = new Date(
      Date.now() + Number(process.env.OTP_BOUNCEBACK) * 1000,
    );
    const ttlDate = new Date(Date.now() + Number(process.env.OTP_TTL) * 1000);
    const newCache = await this.userOtpCacheModel.findOneAndUpdate(
      {
        phone: phone,
      },
      { otp: otp, bounceback: bouncebackDate, ttl: ttlDate },
      { new: true, upsert: true },
    );
    return newCache;
  }
  async sendOtp(phone: string, otp: string) {
    await this.smsService.sendOtp(phone, otp);
  }
  async verifyOtp(phone: string, otp: string) {
    const found = await this.userOtpCacheModel.findOne({
      phone: phone,
      otp: otp,
    });
    return !!found;
  }
  test1() {
    return this.userLoginProfileModel.create({
      userId: '1',
      provider: 'phone',
      identifier: '0123456789',
    });
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
