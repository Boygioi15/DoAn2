import { Controller, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TestUser, TestUserDocument } from './schemas/test_user.schema';
import { Model } from 'mongoose';

@Controller('database')
export class DatabaseController {
  constructor(
    @InjectModel(TestUser.name) private test: Model<TestUserDocument>,
  ) {}
  @Get()
  hello() {
    return 'Hello';
  }
  @Post('test-db-1')
  testDb1() {
    const random = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return this.test.create({
      name: 'Test user' + random,
      sex: 'Gay',
      password: random,
    });
  }
  @Get('test-db-2')
  testDb2() {
    return this.test.find();
  }
  @Get('test-db-3/:id')
  testDb3(@Param('id') id) {
    return this.test.findById(id);
  }
}
