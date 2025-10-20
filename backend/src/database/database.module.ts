import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  UserLoginProfile,
  UserLoginProfileSchema,
} from './schemas/user_login_profile.schema';
import {
  UserOtpCache,
  UserOtpCacheSchema,
} from './schemas/user_otp_cache.schema';
import { DatabaseController } from './database.controller';
import { TestUser, TestUserSchema } from './schemas/test_user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: UserLoginProfile.name,
        schema: UserLoginProfileSchema,
      },
      {
        name: UserOtpCache.name,
        schema: UserOtpCacheSchema,
      },
      {
        name: TestUser.name,
        schema: TestUserSchema,
      },
    ]),
  ],
  controllers: [DatabaseController],
  exports: [MongooseModule],
})
export class DatabaseModule {}
