import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['Nam', 'Nữ', 'Khác'])
  sex?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'birthDate phải là một ngày hợp lệ (ISO format)' },
  )
  birthdate?: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
