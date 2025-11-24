import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FrontendSettingService } from './frontend-setting.service';

@Controller('frontend-setting')
export class FrontendSettingController {
  constructor(
    private readonly frontendSettingService: FrontendSettingService,
  ) {}

  @Get('top-category-data')
  async getTopCategoryData() {
    const result = await this.frontendSettingService.getTopCategoryTree();
    return result;
  }
}
