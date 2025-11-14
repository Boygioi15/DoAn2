import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type UserLoginProfileDocument = HydratedDocument<UserLoginProfile>;
@Schema({ timestamps: true, collection: 'user_login_profile' }) // optional: adds createdAt / updatedAt
export class UserLoginProfile extends Document {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true, // faster lookups
  })
  loginId: string;

  @Prop({ index: true })
  userId: string;

  @Prop()
  provider: string;

  @Prop({ unique: true })
  identifier: string;
}

export const UserLoginProfileSchema =
  SchemaFactory.createForClass(UserLoginProfile);
