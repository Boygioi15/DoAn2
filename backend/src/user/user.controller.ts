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
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() phone: string) {
  //   return this.userService.createNewUser(phone);
  // }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('/account-info')
  getAccountInfo(@Request() req) {
    const userId = req.user.sub;
    return this.userService.getUserInfo(userId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
