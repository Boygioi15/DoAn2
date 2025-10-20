import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type UserLoginProfileDocument = HydratedDocument<UserOtpCache>;
@Schema({ timestamps: true, collection: 'user_otp_cache' }) // optional: adds createdAt / updatedAt
export class UserOtpCache extends Document {
  @Prop({ index: true, unique: true, required: true })
  phone: string;

  @Prop()
  otp: string;

  @Prop({ type: Date })
  bounceback: Date;

  @Prop({ type: Date })
  ttl: Date;
}

export const UserOtpCacheSchema = SchemaFactory.createForClass(UserOtpCache);
