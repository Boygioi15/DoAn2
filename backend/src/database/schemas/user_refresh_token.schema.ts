import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs
import { Document, HydratedDocument } from 'mongoose';

export type UserRefreshTokenDocument = HydratedDocument<UserRefreshToken>;

@Schema({ timestamps: true, collection: 'user_refresh_token' })
export class UserRefreshToken {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true, // faster lookups
  })
  id: string;

  @Prop()
  userId: string;

  @Prop()
  refreshToken: string;
  @Prop({ type: Date, expires: 0 })
  ttl: Date;
}
export const UserRefreshTokenSchema =
  SchemaFactory.createForClass(UserRefreshToken);
