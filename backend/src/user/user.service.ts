import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import {
  UserLoginProfile,
  UserLoginProfileDocument,
} from 'src/database/schemas/user_login_profile.schema';
import { auth_provider } from 'src/constants';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { CreateAddressDto } from './dto/CreateAddress.dto';
import {
  AddressDetailProvince,
  AddressDetailProvinceDocument,
  UserAddress,
  UserAddressDocument,
} from 'src/database/schemas/user_address.schema';
import { UpdateAddressDto } from './dto/UpdateAddress.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserLoginProfile.name)
    private readonly userLoginProfileModel: Model<UserLoginProfileDocument>,
    @InjectModel(UserAddress.name)
    private readonly userAddressModel: Model<UserAddressDocument>,
    @InjectModel(AddressDetailProvince.name)
    private readonly addressDetailProvinceModel: Model<AddressDetailProvinceDocument>,
  ) {}
  async createNewUser() {
    const newUser = await this.userModel.create({});
    return newUser;
  }
  async getAllUser(): Promise<any> {
    const allUserInfos = await this.userModel.find().lean();
    const allUserLoginProfiles = await this.userLoginProfileModel.find().lean();
    //console.log('All user: ', allUserInfos);
    const allUsers = allUserInfos.map((userInfo) => {
      const associatedLoginProfiles = allUserLoginProfiles.filter(
        (loginProfile) => loginProfile.userId === userInfo.userId,
      );
      if (!associatedLoginProfiles) {
        return;
      }
      const email = associatedLoginProfiles.find(
        (loginProfile) => loginProfile.provider === auth_provider.email,
      )?.identifier;
      const phone = associatedLoginProfiles.find(
        (loginProfile) => loginProfile.provider === auth_provider.phone,
      )?.identifier;
      const { password, ..._userInfo } = userInfo;
      const finalUser = {
        ..._userInfo,
        email,
        phone,
      };
      //console.log(finalUser);
      return finalUser;
    });
    return allUsers;
  }
  async getUserInfo(userId: string) {
    //get user basic info
    const user = await this.userModel.findOne({ userId: userId });
    if (!user) {
      throw new InternalServerErrorException('User not found in get user info');
    }
    //get user email, phone, ... auth profiles
    //ineffective mongoDB command

    console.log('Get user info of: ', user);
    const { userPhone, userEmail } = await this.getAllUserLoginProfiles(userId);
    //object to plain and
    const userObj = user.toObject() as any;
    userObj.phone = userPhone;
    userObj.email = userEmail;
    delete userObj.password;
    return userObj;
  }
  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto) {
    const { name, sex, birthdate, phone, email } = updateUserDto;
    //update basic user info
    const newUser = await this.userModel.findOneAndUpdate(
      { userId: userId },
      {
        name,
        sex,
        birthdate,
      },
      { new: true },
    );
    //update login profile info
    const _userId = userId;
    const checkExistedPhone = await this.userLoginProfileModel.find({
      identifier: phone,
      userId: { $ne: _userId },
    });
    console.log('Check existed phone: ', checkExistedPhone);
    if (checkExistedPhone.length > 0) {
      throw new ConflictException('Số điện thoại đã tồn tại');
    }
    const checkExistedEmail = await this.userLoginProfileModel.find({
      identifier: email,
      userId: { $ne: _userId },
    });
    if (checkExistedEmail.length > 0) {
      throw new ConflictException('Email đã tồn tại');
    }
    const updatedPhone = await this.userLoginProfileModel.findOneAndUpdate(
      { userId: userId, provider: auth_provider.phone },
      { identifier: phone },
    );
    const updatedEmail = await this.userLoginProfileModel.findOneAndUpdate(
      { userId: userId, provider: auth_provider.email },
      { identifier: email },
      { upsert: true },
    );
    //re-verifying
    const finalResponse = await this.getUserInfo(userId);
    return finalResponse;
  }

  async getAllUserLoginProfiles(userId: string) {
    const allLoginProfiles = await this.userLoginProfileModel
      .find({
        userId: userId,
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
    return {
      userEmail,
      userPhone,
    };
  }

  async getAllUserAddress(userId: string) {
    const allUserAddress = await this.userAddressModel.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $lookup: {
          from: 'address_detail_province',
          localField: 'addressId',
          foreignField: 'addressId',
          as: 'address_full',
        },
      },
      { $unwind: '$address_full' },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$$ROOT', '$address_full'],
          },
        },
      },
    ]);
    return allUserAddress;
  }
  async createNewUserAddress(userId: string, createAddress: CreateAddressDto) {
    const {
      contact_name,
      contact_phone,
      address_detail,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
    } = createAddress;
    const allUserAddress = await this.getAllUserAddress(userId);
    const newUserAddress = await this.userAddressModel.create({
      userId,
      contact_name,
      contact_phone,
      address_detail,
      isActive: allUserAddress.length === 0, //set default if length = 0
    });
    console.log('New address created', newUserAddress);
    //new detail
    const newAddressDetail = await this.addressDetailProvinceModel.create({
      addressId: newUserAddress.addressId,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
    });
    console.log('New address detail created', newAddressDetail);
    //re-fetch
    return await this.getAllUserAddress(userId);
  }
  async updateUserAddress(userId: string, updateAddress: UpdateAddressDto) {
    const {
      addressId,
      contact_name,
      contact_phone,
      address_detail,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
    } = updateAddress;
    const newUserAddress = await this.userAddressModel.findOneAndUpdate(
      { addressId: updateAddress.addressId },
      {
        userId,
        contact_name,
        contact_phone,
        address_detail,
      },
      { new: true },
    );
    console.log('Address updated: ', newUserAddress);
    //new detail
    const newAddressDetail =
      await this.addressDetailProvinceModel.findOneAndUpdate(
        { addressId: addressId },
        {
          provinceCode,
          provinceName,
          districtCode,
          districtName,
          wardCode,
          wardName,
        },
        { new: true },
      );
    console.log('New address detail updated', newAddressDetail);
    return await this.getAllUserAddress(userId);
  }
  async deleteUserAddress(userId: string, addressId: string) {
    const allUserAddress = await this.getAllUserAddress(userId);
    if (allUserAddress.length === 1) {
      throw new ConflictException('Không thể xóa địa chỉ duy nhất');
    }
    //won't allow deleting default address
    //console.log('A:', allUserAddress);
    const tobeDeletedAddress = allUserAddress.find(
      (address) => address.addressId === addressId,
    );
    //console.log('B:', tobeDeletedAddress);
    if (tobeDeletedAddress.isActive) {
      throw new ConflictException('Không thể xóa địa chỉ mặc định');
    }
    const result = await this.userAddressModel.findOneAndDelete({
      addressId: addressId,
    });
    return await this.getAllUserAddress(userId);
  }
  async setNewDefaultAddress(userId: string, addressId: string) {
    const allUserAddress = await this.getAllUserAddress(userId);

    const previousDefaultAddress = allUserAddress.find(
      (address) => address.isActive,
    );
    const previousAddress = await this.userAddressModel.findOneAndUpdate(
      { addressId: previousDefaultAddress.addressId },
      { isActive: false },
    );
    const newAddress = await this.userAddressModel.findOneAndUpdate(
      { addressId: addressId },
      { isActive: true },
    );
    return await this.getAllUserAddress(userId);
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
