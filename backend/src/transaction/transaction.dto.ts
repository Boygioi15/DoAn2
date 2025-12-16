import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CartItemFe {
  @IsString() @IsNotEmpty() cartItemId: string;
  @IsNumber() @IsNotEmpty() quantity: number;
  @IsNumber() @IsNotEmpty() unitPrice: number;
  @IsNumber() @IsNotEmpty() cashoutPrice: number;

  @IsString() @IsNotEmpty() productId: string;
  @IsString() @IsNotEmpty() variantId: string;

  @IsString() @IsNotEmpty() product_name: string;
  @IsString() @IsNotEmpty() product_thumbnail: string;
  @IsString() @IsNotEmpty() product_sku: string;

  @IsString() @IsNotEmpty() variant_thumbnail: string;
  @IsString() @IsNotEmpty() variant_color: string;
  @IsString() @IsNotEmpty() variant_size: string;
  @IsString() @IsNotEmpty() variant_sku: string;
}
export class PaymentDetailFe {
  @IsNotEmpty() @IsString() payment_method: string;
  @IsNotEmpty() @IsNumber() payment_default_price: number;
  @IsNotEmpty() @IsNumber() payment_cashout_price: number;
}
export class AddressInfoFe {
  @IsNotEmpty() address_name: string;
  @IsNotEmpty() address_phone: string;
  @IsNotEmpty() address_province_code: number;
  @IsNotEmpty() address_province_name: string;
  @IsNotEmpty() address_district_code: number;
  @IsNotEmpty() address_district_name: string;
  @IsNotEmpty() address_ward_code: number;
  @IsNotEmpty() address_ward_name: string;
  @IsNotEmpty() address_detail: string;

  @IsOptional() reference_address: string;
}
