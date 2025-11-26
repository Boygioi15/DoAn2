import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'frontend-setting' })
export class FrontendSetting {
  @Prop()
  homepage_banner: string[];

  @Prop()
  toplayout_rotator_message: string[];
}
export type FrontendSettingDocument = HydratedDocument<FrontendSetting>;
export const FrontendSettingSchema =
  SchemaFactory.createForClass(FrontendSetting);
