import { Module } from '@nestjs/common';
import { FrontendSettingService } from './frontend-setting.service';
import { FrontendSettingController } from './frontend-setting.controller';
import { CategoryModule } from 'src/category/category.module';
import { DatabaseModule } from 'src/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [FrontendSettingController],
  providers: [FrontendSettingService],
  imports: [CategoryModule, DatabaseModule, CloudinaryModule],
})
export class FrontendSettingModule {}
