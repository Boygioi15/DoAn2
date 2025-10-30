import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import {
  UserLoginProfile,
  UserLoginProfileDocument,
} from 'src/database/schemas/user_login_profile.schema';
import { auth_provider } from 'src/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserLoginProfile.name)
    private readonly userLoginProfileModel: Model<UserLoginProfileDocument>,
  ) {}
  async createNewUser() {
    const newUser = await this.userModel.create({});
    return newUser;
  }
  async getUserInfo(id: string) {
    //get user basic info
    const user = await this.userModel.findOne({ userId: id }).lean();
    if (!user) {
      throw new InternalServerErrorException('User not found in get user info');
    }
    //get user email, phone, ... auth profiles
    //ineffective mongoDB command
    const allLoginProfiles = await this.userLoginProfileModel
      .find({
        userId: id,
      })
      .lean();
    //phone
    const userPhone = allLoginProfiles.find(
      (element) => element.provider === auth_provider.phone,
    )?.identifier;
    //email
    const userEmail = allLoginProfiles.find(
      (element) => element.provider === auth_provider.email,
    )?.identifier;
    //object to plain and
    const userObj = user.toObject() as any;
    userObj.phone = userPhone;
    userObj.email = userEmail;
    delete userObj.password;
    return userObj;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
