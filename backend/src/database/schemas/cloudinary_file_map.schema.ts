import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'file_map' })
export class CloudinaryFileMap {
  @Prop()
  url: string;

  @Prop()
  publicId: string;
}
export type CloudinaryFileMapDocument = HydratedDocument<CloudinaryFileMap>;
export const CloudinaryFileMapSchema =
  SchemaFactory.createForClass(CloudinaryFileMap);
