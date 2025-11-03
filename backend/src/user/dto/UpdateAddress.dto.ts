import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './CreateAddress.dto';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
