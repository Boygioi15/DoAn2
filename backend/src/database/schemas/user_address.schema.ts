import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type UserAddressDocument = HydratedDocument<UserAddress>;
export type AddressDetailProvinceDocument =
  HydratedDocument<AddressDetailProvince>;

@Schema({ timestamps: true, collection: 'user_address' }) // optional: adds createdAt / updatedAt
export class UserAddress {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true, // faster lookups
  })
  addressId: string;

  @Prop({ index: true })
  userId: string;

  @Prop()
  contact_name: string;
  @Prop()
  contact_phone: string;

  @Prop()
  isActive: boolean;

  @Prop()
  address_detail: string;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

@Schema({ timestamps: true, collection: 'address_detail_province' })
export class AddressDetailProvince extends Document {
  @Prop({
    type: String,
    unique: true, // ensure uniqueness in DB
    index: true,
  }) // faster lookups
  addressId: string;

  @Prop()
  provinceName: string;
  @Prop()
  provinceCode: string;

  @Prop()
  districtName: string;
  @Prop()
  districtCode: string;

  @Prop()
  wardName: string;
  @Prop()
  wardCode: string;
}
export const AddressDetailProvinceSchema = SchemaFactory.createForClass(
  AddressDetailProvince,
);
