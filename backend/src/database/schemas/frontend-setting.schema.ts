import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ImageResource {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  relativePath: string;
}

@Schema({ timestamps: true, collection: 'frontend-setting' })
export class FrontendSetting {
  @Prop({ type: ImageResource })
  announcementBar: ImageResource;
  @Prop()
  announcementCarousel: string[];

  @Prop({ type: [ImageResource] })
  heroCarousel: ImageResource[];

  @Prop({
    type: Map,
    of: String,
    default: {},
  })
  categoryPageSetting: Map<string, string>;

  @Prop() loyalCustomerConditionPage: string;
  @Prop() loyalCustomerPolicyPage: string;
  @Prop() customerSecurityPolicyPage: string;
  @Prop() deliveryPolicyPage: string;
  @Prop() generalSizeGuidancePage: string;
  @Prop() contactPage: string;
  @Prop() aboutPage: string;
}
export const ImageResourceSchema = SchemaFactory.createForClass(ImageResource);

export type FrontendSettingDocument = HydratedDocument<FrontendSetting>;
export const FrontendSettingSchema =
  SchemaFactory.createForClass(FrontendSetting);
