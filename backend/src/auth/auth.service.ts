import { Inject, Injectable } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import {
  UserRefreshToken,
  UserRefreshTokenDocument,
} from 'src/database/schemas/user_refresh_token.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsServiceService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(UserLoginProfile.name)
    private userLoginProfileModel: Model<UserLoginProfileDocument>,
    @InjectModel(UserOtpCache.name)
    private userOtpCacheModel: Model<UserOtpCacheDocument>,
    @InjectModel(UserRefreshToken.name)
    private userRefreshTokenModel: Model<UserRefreshTokenDocument>,
  ) {}
  async checkPhoneRegistered(phone: string) {
    const phoneExist = !!(await this.userLoginProfileModel.findOne({
      provider: auth_provider.phone,
      identifier: phone,
    }));
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
  async findUserWithPhone(phone: string) {
    const loginProfile = await this.userLoginProfileModel.findOne({
      provider: auth_provider.phone,
      identifier: phone,
    });
    //console.log(loginProfile);
    const user = await this.userModel.findOne({ userId: loginProfile?.userId });
    //console.log(user);
    return user;
  }
  async signAccessToken(user: UserDocument) {
    const payload = { sub: user.userId };
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL);

    if (!JWT_ACCESS_SECRET || !JWT_ACCESS_TTL) {
      throw new Error('Missing JWT_ACCESS_SECRET or JWT_ACCESS_TTL in .env');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_TTL,
    });
    return accessToken;
  }
  async signRefreshToken(user: UserDocument) {
    const payload = { sub: user.userId };
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    const JWT_REFRESH_TTL = Number(process.env.JWT_REFRESH_TTL) * 24 * 60 * 60;

    if (!JWT_REFRESH_SECRET || !JWT_REFRESH_TTL) {
      throw new Error('Missing JWT_REFRESH_SECRET or JWT_REFRESH_TTL in .env');
    }

    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_TTL,
    });
    return refreshToken;
  }
  async createRefreshTokenCache(userId: string, refreshToken: string) {
    const refreshToken_TTL = 120 * 1000;
    //Number(process.env.JWT_REFRESH_TTL) * 24 * 60 * 60 * 1000;
    const newCache = await this.userRefreshTokenModel.create({
      userId: userId,
      refreshToken: refreshToken,
      ttl: refreshToken_TTL,
    });
    return newCache;
  }
  authenticateUser_account(
    plainPassword: string,
    phone?: string,
    email?: string,
  ) {
    //check login info
  }
  authenticateUser_sms(phone: string, otp: string) {}
  async createNewLoginProfile(
    userId: string,
    provider: string,
    identifier: string,
  ) {
    const newLoginProfile = await this.userLoginProfileModel.create({
      userId,
      provider,
      identifier,
    });
  }
  test1() {
    return this.userLoginProfileModel.create({
      userId: '1',
      provider: 'phone',
      identifier: '0123456789',
    });
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
