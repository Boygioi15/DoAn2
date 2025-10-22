import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type UserAddressDocument = HydratedDocument<UserAddress>;
@Schema({ timestamps: true, collection: 'user_address' }) // optional: adds createdAt / updatedAt
export class UserAddress extends Document {
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
  remindName: string;

  @Prop()
  isActive: boolean;

  @Prop()
  address: string;

  @Prop()
  contactPhone: string;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
