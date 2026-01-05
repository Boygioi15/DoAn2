import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FrontendSettingService } from './frontend-setting.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('frontend-setting')
export class FrontendSettingController {
  constructor(
    private readonly frontendSettingService: FrontendSettingService,
  ) {}
  @Post('reset-frontend-setting')
  async initFrontendSetting() {
    const result = await this.frontendSettingService.resetFrontendSetting();
    return { stt: 200 };
  }
  @Get('setting/layout')
  async getLayoutSetting() {
    return await this.frontendSettingService.getLayoutSetting();
  }
  @Get('setting/homepage')
  async getHomepageSetting() {
    return await this.frontendSettingService.getHomepageSetting();
  }
  @Get('setting/category/:categoryId')
  async getCategoryPageSetting(@Param('categoryId') categoryId: string) {
    return await this.frontendSettingService.getCategoryPageSetting(categoryId);
  }
  @Get('setting/:setting')
  async getFrontendSetting(@Param('setting') setting: string) {
    return await this.frontendSettingService.getFrontendSetting(setting);
  }
  @Get('setting')
  async getAllFrontendSetting() {
    return await this.frontendSettingService.getAllSetting();
  }
  @Patch('setting/:setting')
  async updateFrontendSetting(
    @Param('setting') setting: string,
    @Body('content') content: any,
  ) {
    console.log('S: ', setting);
    console.log('C: ', content);
    return await this.frontendSettingService.updateFrontendSetting(
      setting,
      content,
    );
  }
  @Get('page/:page')
  async getFrontendPage(@Param('page') page: string) {
    return await this.frontendSettingService.getFrontendPage(page);
  }
  @Patch('page/:page')
  async updateFrontendPage(
    @Param('page') page: string,
    @Body('content') content: string,
  ) {
    return await this.frontendSettingService.updateFrontendPage(page, content);
  }
}
