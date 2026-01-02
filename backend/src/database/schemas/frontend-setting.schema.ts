import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'frontend-setting' })
export class FrontendSetting {
  @Prop()
  toplayout_banner: string;

  @Prop()
  homepage_banner: string[];

  @Prop() toplayout_rotator_message: string[];

  @Prop() loyalCustomerConditionPage: string;
  @Prop() loyalCustomerPolicyPage: string;
  @Prop() customerSecurityPolicyPage: string;
  @Prop() deliveryPolicyPage: string;
  @Prop() generalSizeGuidancePage: string;
  @Prop() contactPage: string;
  @Prop() aboutPage: string;
}
export type FrontendSettingDocument = HydratedDocument<FrontendSetting>;
export const FrontendSettingSchema =
  SchemaFactory.createForClass(FrontendSetting);
