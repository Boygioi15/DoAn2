import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CartDocument = HydratedDocument<Cart>;
export type CartItemDocument = HydratedDocument<CartItem>;
@Schema({ timestamps: true, collection: 'cart' })
export class Cart {
  @Prop()
  cartId: string;

  //reference to user
  @Prop({})
  userId: string;

  @Prop({ default: 0 })
  totalItem: number;

  @Prop()
  defaultPrice: number;
  @Prop()
  cashoutPrice: number;
}

@Schema({ timestamps: true, collection: 'cart_item' })
export class CartItem {
  @Prop()
  cartItemId: string;

  @Prop()
  cartId: string;

  @Prop({ default: 1 })
  quantity: number;
  @Prop()
  maxAllowedQuantity: number;
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

  @Prop()
  defaultPrice: number;
  @Prop()
  cashoutPrice: number;
}
export const CartSchema = SchemaFactory.createForClass(Cart);
export const CartItemSchema = SchemaFactory.createForClass(CartItem);
