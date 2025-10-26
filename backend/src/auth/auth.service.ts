import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
import {
  auth_provider,
  otp_bounceback,
  otp_ttl,
  refreshToken_ttl,
} from '../constants';
import { SmsServiceService } from 'src/sms_service/sms_service.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import {
  UserRefreshToken,
  UserRefreshTokenDocument,
} from 'src/database/schemas/user_refresh_token.schema';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

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
  //work for phone + email
  findIdentifierInOtp(identifier: string) {
    const identifierExist = this.userOtpCacheModel.findOne({
      identifier: identifier,
    });
    return identifierExist;
  }
  async createOtpCache(identifier: string, otp: string) {
    const bouncebackDate = new Date(Date.now() + otp_bounceback * 1000);
    //console.log(Number(process.env.OTP_BOUNCEBACK));
    const ttlDate = new Date(Date.now() + otp_ttl * 1000);
    console.log(bouncebackDate, ttlDate);
    const newCache = await this.userOtpCacheModel.create({
      identifier: identifier,
      otp: otp,
      bounceback: bouncebackDate,
      ttl: ttlDate,
    });
    return newCache;
  }
  async updateOtpCache(identifier: string, otp: string) {
    const bouncebackDate = new Date(Date.now() + otp_bounceback * 1000);
    const ttlDate = new Date(Date.now() + otp_ttl * 1000);
    const newCache = await this.userOtpCacheModel.findOneAndUpdate(
      {
        identifier: identifier,
      },
      { otp: otp, bounceback: bouncebackDate, ttl: ttlDate },
      { new: true, upsert: true },
    );
    return newCache;
  }
  async sendOtp(phone: string, otp: string) {
    await this.smsService.sendOtp(phone, otp);
  }
  //works for email + phone provider, use for both sign up, sign in
  async verifyOtp(identifier: string, otp: string) {
    const found = await this.userOtpCacheModel.findOne({
      identifier: identifier,
      otp: otp,
    });
    return !!found;
  }
  async verifyAccountPassword(identifier: string, password: string) {
    const user = await this.findUserWithIdentifier(identifier);
    if (user) {
      const passwordMatch = this.HELPER_compareHashedPassword(
        password,
        user.password,
      );
      if (!passwordMatch) {
        throw new UnauthorizedException();
      }
      return user;
    }
    return null;
  }
  //works for email + phone provider
  async findUserWithIdentifier(identifier: string) {
    const loginProfile = await this.userLoginProfileModel.findOne({
      provider: auth_provider.phone || auth_provider.email,
      identifier: identifier,
    });
    const user = await this.userModel.findOne({ userId: loginProfile?.userId });
    return user;
  }
  async signAccessToken(userId: string) {
    const payload = { sub: userId };
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL);

    if (!JWT_ACCESS_SECRET || !JWT_ACCESS_TTL) {
      throw new InternalServerErrorException(
        'Missing JWT_ACCESS_SECRET or JWT_ACCESS_TTL in .env',
      );
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_TTL,
    });
    return accessToken;
  }
  async signRefreshToken(userId: string) {
    const payload = { sub: userId };
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
    const refreshToken_TTL = new Date(Date.now() + refreshToken_ttl * 1000);
    //Number(process.env.JWT_REFRESH_TTL) * 24 * 60 * 60 * 1000;
    const newCache = await this.userRefreshTokenModel.create({
      userId: userId,
      refreshToken: refreshToken,
      ttl: refreshToken_TTL,
    });
    return newCache;
  }
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
    return newLoginProfile;
  }

  async updateUserPassword(userId: string, updatePassword: UpdatePasswordDto) {
    const user = await this.userModel.findOne({ userId: userId });
    if (!user) {
      throw new InternalServerErrorException({
        stt: 500,
        msg: 'Không tìm thấy user!',
      });
    }
    const currentPass = user?.password;
    const { oldPassword, newPassword, confirmNewPassword } = updatePassword;
    //sign up flow, doesn't have to check for user old pass!
    const updateUserPassword_Function = async () => {
      const newPass = this.HELPER_hashPassword(newPassword);
      console.log('Update password - new password: ', newPass);
      user.password = newPass;
      await user.save();
      console.log('Update password - user saved!');
      return user;
    };
    if (!currentPass) {
      console.log('Update password - first time registering');
      const user = updateUserPassword_Function();
      return;
    }
    if (!oldPassword) {
      throw new BadRequestException({
        stt: 400,
        msg: 'Yêu cầu không hợp lệ!',
      });
    }
    const oldPassMatch = this.HELPER_compareHashedPassword(
      oldPassword,
      user.password,
    );
    console.log('Update password - matching:', oldPassMatch);
    if (!oldPassMatch) {
      throw new BadRequestException({
        stt: 400,
        msg: 'Mật khẩu cũ không đúng!',
      });
    }
    updateUserPassword_Function();
  }
  async getNewAccessToken(userId: string, refreshToken: string) {
    //check if user + refresh token exist in db?
    const refreshCache = await this.userRefreshTokenModel.findOne({
      userId: userId,
      refreshToken: refreshToken,
    });
    if (!refreshCache) {
      throw new BadRequestException(
        'Không tồn tại refresh token tương ứng trong db!',
      );
    }
    //sign new access token
    const newAccessToken = this.signAccessToken(userId);
    return newAccessToken;
  }
  async signOut(userId: string, refreshToken: string) {
    //check if user + refresh token exist in db?
    const refreshCache = await this.userRefreshTokenModel.findOneAndDelete({
      userId: userId,
      refreshToken: refreshToken,
    });
    if (!refreshCache) {
      throw new BadRequestException(
        'Không tồn tại refresh token tương ứng trong db!',
      );
    }
    return;
  }
  HELPER_hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(Number(process.env.BCRYPT_SALT_ROUN));
    const hashed = bcrypt.hashSync(password, salt);
    return hashed;
  }
  HELPER_compareHashedPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
  test1() {
    return this.userLoginProfileModel.create({
      userId: '1',
      provider: 'phone',
      identifier: '0123456789',
    });
  }
}
