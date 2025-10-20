import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import type { Request } from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/abcd/*test')
  getHello(@Req() req: Request): string {
    return this.appService.getHello();
  }
}
