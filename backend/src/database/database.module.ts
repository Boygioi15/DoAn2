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
  Product_Option,
  ProductDescription,
  ProductDescriptionSchema,
  ProductOptionSchema,
  ProductProperty,
  ProductPropertySchema,
  ProductSchema,
  ProductSizeGuidance,
  ProductSizeSchema,
  ProductVariant,
  ProductVariantSchema,
  VariantOption,
  VariantOptionSchema,
} from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import {
  FrontendSetting,
  FrontendSettingSchema,
} from './schemas/frontend-setting.schema';
import {
  CloudinaryFileMap,
  CloudinaryFileMapSchema,
} from './schemas/cloudinary_file_map.schema';
import {
  Cart,
  CartItem,
  CartItemSchema,
  CartSchema,
} from './schemas/cart.schema';
import {
  Order,
  OrderDetail,
  orderDetailSchema,
  orderSchema,
} from './schemas/transaction.schema';
import {
  ProductEmbedding,
  ProductEmbeddingSchema,
} from './schemas/product_embedding.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: orderSchema },
      { name: OrderDetail.name, schema: orderDetailSchema },
      { name: Cart.name, schema: CartSchema },
      { name: CartItem.name, schema: CartItemSchema },
      { name: Product.name, schema: ProductSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: VariantOption.name, schema: VariantOptionSchema },
      { name: Product_Option.name, schema: ProductOptionSchema },
      { name: ProductSizeGuidance.name, schema: ProductSizeSchema },
      { name: ProductProperty.name, schema: ProductPropertySchema },
      { name: ProductDescription.name, schema: ProductDescriptionSchema },

      { name: Category.name, schema: CategorySchema },

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
      {
        name: FrontendSetting.name,
        schema: FrontendSettingSchema,
      },
      {
        name: CloudinaryFileMap.name,
        schema: CloudinaryFileMapSchema,
      },
      {
        name: ProductEmbedding.name,
        schema: ProductEmbeddingSchema,
      },
    ]),
  ],
  controllers: [DatabaseController],
  exports: [MongooseModule],
})
export class DatabaseModule {}
