import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import { v4 } from 'uuid';

export type OrderDocument = HydratedDocument<Order>;
export type OrderDetailDocument = HydratedDocument<OrderDetail>;
@Schema({ timestamps: true, collection: 'order' })
export class Order {
  @Prop() address_name: string;
  @Prop() address_phone: string;
  @Prop() address_province_code: number;
  @Prop() address_province_name: string;
  @Prop() address_district_code: number;
  @Prop() address_district_name: string;
  @Prop() address_ward_code: number;
  @Prop() address_ward_name: string;
  @Prop() address_detail: string;

  //momo, cod
  @Prop() payment_method: string;
  @Prop() payment_default_price: number;
  @Prop() payment_cashout_price: number;

  //payment gateway related
  //order payment status: all, created, pending, succeeded, failed, cancelled
  @Prop({ default: 'created' }) payment_state: string;
  @Prop() payment_gateway_code: number;
  @Prop() payment_url: string;

  //reference
  @Prop() reference_user: string;
  @Prop() reference_address: string;
  @Prop() email: string;

  //delivery
  //order delivery status: all, pending, ongoing, delivered, succeeded, failed, canceled
  @Prop({ default: 'pending' }) delivery_state: string;
}

@Schema({ timestamps: true, collection: 'order_detail' })
export class OrderDetail {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Order' })
  orderId: mongoose.Types.ObjectId;
  // flatten item fields
  @Prop() quantity: number;
  @Prop() unitPrice: number;
  @Prop() cashoutPrice: number;

  @Prop() productId: string;
  @Prop() variantId: string;

  @Prop() product_name: string;
  @Prop() product_thumbnail: string;
  @Prop() product_sku: string;

  @Prop() variant_thumbnail: string;
  @Prop() variant_color: string;
  @Prop() variant_size: string;
  @Prop() variant_sku: string;
}
export const orderSchema = SchemaFactory.createForClass(Order);
export const orderDetailSchema = SchemaFactory.createForClass(OrderDetail);
