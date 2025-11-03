import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;
export type ProductVariantDocument = HydratedDocument<ProductVariant>;
export type VariantOptionDocument = HydratedDocument<VariantOption>;

@Schema({ timestamps: true, collection: 'product' })
export class Product {
  @Prop()
  productId: string;

  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  display_price: number;

  @Prop()
  display_thumbnail_image: string;

  @Prop()
  categoryId: string;
}

@Schema({ timestamps: true, collection: 'product_variant' })
export class ProductVariant {
  @Prop()
  variantId: string;

  @Prop()
  productId: string;

  @Prop()
  sku: string;

  @Prop()
  price: string;

  @Prop()
  image: string;
}

@Schema({ timestamps: true, collection: 'variant_option' })
export class VariantOption {
  @Prop()
  optionId: string;

  @Prop()
  variantId: string;

  @Prop()
  name: string;

  @Prop()
  value: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
export const VariantOptionSchema = SchemaFactory.createForClass(VariantOption);
