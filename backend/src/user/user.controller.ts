import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { CreateAddressDto } from './dto/CreateAddress.dto';
import { UpdateAddressDto } from './dto/UpdateAddress.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() phone: string) {
  //   return this.userService.createNewUser(phone);
  // }

  @Get()
  async getAllUser() {
    const allUser = await this.userService.getAllUser();
    return { stt: 200, allUser };
  }
  @UseGuards(JwtGuard)
  @Get('/account-info')
  async getAccountInfo(@Request() req) {
    const userId = req.user.userId;
    const accountInfo = await this.userService.getUserInfo(userId);
    return { stt: 200, accountInfo };
  }
  @UseGuards(JwtGuard)
  @Post('/account-info')
  async updateAccountInfo(@Request() req, @Body() body: UpdateUserDto) {
    const userId = req.user.userId;
    const accountInfo = await this.userService.updateUserInfo(userId, body);
    return { stt: 200, accountInfo };
  }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }
  @UseGuards(JwtGuard)
  @Get('/address')
  async getAllUserAddress(@Request() req) {
    const userId = req.user.userId;
    const allUserAddress = await this.userService.getAllUserAddress(userId);
    console.log('All user addresses: ', allUserAddress);
    return { stt: 200, newAllUserAddress: allUserAddress };
  }
  @UseGuards(JwtGuard)
  @Get('/address-default')
  async getDefaultAddress(@Request() req) {
    const userId = req.user.userId;
    const defaultUserAddress =
      await this.userService.getDefaultAddressOfUser(userId);
    return defaultUserAddress;
  }
  @UseGuards(JwtGuard)
  @Post('/address')
  async createNewUserAddress(
    @Request() req,
    @Body() createNewUserAddress: CreateAddressDto,
  ) {
    const userId = req.user.userId;
    const newAllUserAddress = await this.userService.createNewUserAddress(
      userId,
      createNewUserAddress,
    );
    console.log('All user addresses after creating: ', newAllUserAddress);

    return { stt: 200, newAllUserAddress };
  }
  @UseGuards(JwtGuard)
  @Patch('/address')
  async updateUserAddress(
    @Request() req,
    @Body() updateUserAddress: UpdateAddressDto,
  ) {
    const userId = req.user.userId;
    const newAllUserAddress = await this.userService.updateUserAddress(
      userId,
      updateUserAddress,
    );
    return { stt: 200, newAllUserAddress };
  }
  @UseGuards(JwtGuard)
  @Delete('/address/:addressId')
  async deleteUserAddress(
    @Request() req,
    @Param('addressId') addressId: string,
  ) {
    const userId = req.user.userId;
    const newAllUserAddress = await this.userService.deleteUserAddress(
      userId,
      addressId,
    );
    return { stt: 200, newAllUserAddress };
  }
  @UseGuards(JwtGuard)
  @Patch('/address/set-default/:addressId')
  async setNewDefaultAddress(
    @Request() req,
    @Param('addressId') addressId: string,
  ) {
    const userId = req.user.userId;
    const newAllUserAddress = await this.userService.setNewDefaultAddress(
      userId,
      addressId,
    );
    return { stt: 200, newAllUserAddress };
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
