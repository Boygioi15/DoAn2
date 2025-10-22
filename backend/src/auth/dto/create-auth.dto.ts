import { IsString } from 'class-validator';

export class AuthenticateUserDto {
  @IsString()
  method: string;
  account?: string;
  password?: string;

  phone?: string;
  otp?: string;
}
