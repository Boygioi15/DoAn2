import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { User, UserSchema } from './schemas/user.schema';
import {
  AddressDetailProvince,
  AddressDetailProvinceSchema,
  UserAddress,
  UserAddressSchema,
} from './schemas/user_address.schema';
import {
  UserRefreshToken,
  UserRefreshTokenSchema,
} from './schemas/user_refresh_token.schema';
import {
  Product,
  ProductSchema,
  ProductVariant,
  ProductVariantSchema,
  VariantOption,
  VariantOptionSchema,
} from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: VariantOption.name, schema: VariantOptionSchema },

      { name: User.name, schema: UserSchema },
      { name: UserAddress.name, schema: UserAddressSchema },
      { name: AddressDetailProvince.name, schema: AddressDetailProvinceSchema },
      {
        name: UserLoginProfile.name,
        schema: UserLoginProfileSchema,
      },
      {
        name: UserOtpCache.name,
        schema: UserOtpCacheSchema,
      },
      {
        name: UserRefreshToken.name,
        schema: UserRefreshTokenSchema,
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
