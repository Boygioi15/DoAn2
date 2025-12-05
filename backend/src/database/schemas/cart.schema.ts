import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 } from 'uuid';
export type CartDocument = HydratedDocument<Cart>;
export type CartItemDocument = HydratedDocument<CartItem>;
@Schema({ timestamps: true, collection: 'cart' })
export class Cart {
  @Prop({
    type: String,
    default: v4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  cartId: string;

  //reference to user
  @Prop()
  userId: string;

  @Prop({ default: 0 })
  totalItem: number;

  @Prop({ default: 0 })
  defaultPrice: number;
  @Prop({ default: 0 })
  cashoutPrice: number;

  @Prop({ default: false })
  allSelected: boolean;
  @Prop({ default: 0 })
  totalSelected: number;
  @Prop({ default: false })
  allowedToPurchase: boolean;
}

@Schema({ timestamps: true, collection: 'cart_item' })
export class CartItem {
  @Prop({
    type: String,
    default: v4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  cartItemId: string;

  @Prop()
  cartId: string;

  @Prop({ default: 1 })
  quantity: number;
  @Prop()
  maxAllowedQuantity: number;

  @Prop()
  unitPrice: number;
  @Prop()
  cashoutPrice: number;

  @Prop({ default: true })
  selected: boolean;

  @Prop()
  productId: string;
  @Prop()
  variantId: string;

  @Prop()
  product_name: string;
  @Prop()
  product_thumbnail: string;

  @Prop()
  variant_thumbnail: string;
  @Prop()
  variant_color: string;
  @Prop()
  variant_size: string;
}
export const CartSchema = SchemaFactory.createForClass(Cart);
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
