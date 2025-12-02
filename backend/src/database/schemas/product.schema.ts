import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type ProductDocument = HydratedDocument<Product>;
export type ProductVariantDocument = HydratedDocument<ProductVariant>;
export type VariantOptionDocument = HydratedDocument<VariantOption>;
export type Product_OptionDocument = HydratedDocument<Product_Option>;

export type ProductPropertyDocument = HydratedDocument<ProductProperty>;
export type ProductDescriptionDocument = HydratedDocument<ProductDescription>;
@Schema({ timestamps: true, collection: 'product' })
export class Product {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  productId: string;

  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  sku: string;

  @Prop()
  display_thumbnail_image: string;

  @Prop()
  categoryId: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isDrafted: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  //denormalized fields
  @Prop()
  minPrice: number;

  @Prop()
  totalStock: number;

  @Prop()
  allColors: string[];

  @Prop()
  allSizes: string[];
}

@Schema({ timestamps: true, collection: 'product_variant' })
export class ProductVariant {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  variantId: string;
  @Prop()
  stock: number;

  @Prop()
  seller_sku: string;

  @Prop({ unique: true })
  platform_sku: string;

  @Prop()
  price: number;

  @Prop()
  isInUse: boolean;

  @Prop()
  isOpenToSale: boolean;
}

@Schema({ timestamps: true, collection: 'variant_option' })
export class VariantOption {
  @Prop({
    type: String,
    default: uuidv4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  optionId: string;

  @Prop()
  name: string;

  @Prop()
  value: string;

  @Prop()
  index: number;

  @Prop()
  image: string[];
}
@Schema({ timestamps: true, collection: 'product_option' })
export class Product_Option {
  @Prop()
  productId: string;

  @Prop()
  variantId: string;

  @Prop()
  optionId: string;
}

//product detail
@Schema({ timestamps: true, collection: 'product_detail_property' })
export class ProductProperty {
  @Prop()
  productId: string;

  @Prop()
  name: string;

  @Prop()
  value: string;
}
@Schema({ timestamps: true, collection: 'product_detail_description' })
export class ProductDescription {
  @Prop()
  productId: string;

  @Prop()
  description: string;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
export const VariantOptionSchema = SchemaFactory.createForClass(VariantOption);
export const ProductOptionSchema = SchemaFactory.createForClass(Product_Option);
export const ProductPropertySchema =
  SchemaFactory.createForClass(ProductProperty);
export const ProductDescriptionSchema =
  SchemaFactory.createForClass(ProductDescription);
