import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserLoginProfile,
  UserLoginProfileDocument,
} from 'src/database/schemas/user_login_profile.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserLoginProfile.name)
    private userLoginProfileModel: Model<UserLoginProfileDocument>,
  ) {}
  checkPhone(phone: string) {}
  test1() {
    return this.userLoginProfileModel.create({
      userId: '1',
      provider: 'phone',
      identifier: '0123456789',
    });
  }
  testDb2() {
    this.userLoginProfileModel.find();
  }
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
