import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  oldPassword?: string;
  @IsString()
  newPassword: string;
  @IsString()
  confirmNewPassword: string;
}
