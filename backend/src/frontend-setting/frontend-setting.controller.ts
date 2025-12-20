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
  @Post('init-frontend-setting')
  async initFrontendSetting() {
    const result = await this.frontendSettingService.initFrontendSetting();
  }
  @Get('toplayout-category-data')
  async getTopCategoryData() {
    const result = await this.frontendSettingService.getTopCategoryTree();
    return result;
  }
  @Get('homepage-banner')
  async getHomepageBanner() {
    return await this.frontendSettingService.getHomepageBanner();
  }
  @Get('toplayout-rotator-message')
  async getToplayoutRotatorMessage() {
    return await this.frontendSettingService.getToplayoutRotatorMessage();
  }
  @UseInterceptors(FilesInterceptor('homepage-banner'))
  @Post('homepage-banner')
  async updateHomepageBanner(
    @UploadedFiles() bannerFile: Express.Multer.File[],
  ) {
    console.log('Banner file: ', bannerFile);
    return await this.frontendSettingService.updateHomepageBanner(bannerFile);
  }
  @Post('toplayout-rotator-message')
  async updateToplayoutRotatorMessage(
    @Body('rotator-message') messages: string[],
  ) {
    return await this.frontendSettingService.updateToplayoutRotatorMessage(
      messages,
    );
  }
}
