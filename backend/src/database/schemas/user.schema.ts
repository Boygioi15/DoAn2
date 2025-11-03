import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true, collection: 'user' }) // optional: adds createdAt / updatedAt
export class User extends Document {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true, // faster lookups
  })
  userId: string;

  @Prop()
  name: string;

  @Prop()
  sex: string;

  @Prop({ type: Date })
  birthdate: Date; // ✅ correct type is JS Date (mongoose Date maps to it)

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
