import { Prop, Schema } from '@nestjs/mongoose';
import { v4 } from 'uuid';

@Schema({ timestamps: true, collection: 'transaction' })
export class Transaction {
  @Prop({
    type: String,
    default: v4, // auto-generate unique string id
    unique: true, // ensure uniqueness in DB
    index: true,
  })
  transactionId: string;
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
  @Prop() payment_checked: boolean;

  //reference
  @Prop() reference_user: string;
  @Prop() reference_address: string;

  //delivery
  @Prop() delivery_state: string;
}

@Schema({ timestamps: true, collection: 'transaction_detail' })
export class TransactionDetail {
  @Prop()
  transactionId: string;
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
