import { IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  contact_name: string;
  @IsString()
  contact_phone: string;

  @IsString()
  address_detail: string;

  @IsString()
  provinceName: string;
  @IsNumber()
  provinceCode: number;

  @IsString()
  districtName: string;
  @IsNumber()
  districtCode: number;

  @IsString()
  wardName: string;
  @IsNumber()
  wardCode: number;

  addressId: string;
  isActive: boolean;
}
