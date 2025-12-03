import { IsNotEmpty, IsString } from 'class-validator';

export class AddNewItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;
  @IsNotEmpty()
  @IsString()
  variantId: string;
}
export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;
  @IsNotEmpty()
  @IsString()
  variantId: string;
}
