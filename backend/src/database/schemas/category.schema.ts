import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export type CategoryDocument = HydratedDocument<Category>;
@Schema({ timestamps: true, collection: 'category' })
export class Category {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  }) // faster lookups})
  categoryId: string;

  @Prop()
  categoryName: string;

  @Prop()
  parentId: string;

  @Prop({ default: 1 })
  categoryLevel: number;

  @Prop({ default: 0 })
  totalAssociatedProduct: number;
  @Prop({ default: false })
  isDefault: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
