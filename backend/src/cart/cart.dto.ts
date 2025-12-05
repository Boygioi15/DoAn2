import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddNewItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;
  @IsNotEmpty()
  @IsString()
  variantId: string;
}
export class UpdateCartItemQuantityDto {
  @IsNotEmpty()
  @IsString()
  cartItemId: string;
  @IsNotEmpty()
  @IsNumber()
  newQuantity: number;
}
