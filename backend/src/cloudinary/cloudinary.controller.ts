import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  @Post('test-upload1')
  @UseInterceptors(FileInterceptor('file'))
  async testUploadFile1(@UploadedFile('file') file: Express.Multer.File) {
    const response = await this.cloudinaryService.uploadFile(file);
    console.log(response);
    return;
  }
  @Delete('reset-storage')
  async resetStorage() {
    for (let i = 0; i < 5; i++) {
      const response = await this.cloudinaryService.resetStorage();
    }
    return true;
  }
}
