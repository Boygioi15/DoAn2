import { Module } from '@nestjs/common';
import { FrontendSettingService } from './frontend-setting.service';
import { FrontendSettingController } from './frontend-setting.controller';
import { CategoryModule } from 'src/category/category.module';

@Module({
  controllers: [FrontendSettingController],
  providers: [FrontendSettingService],
  imports: [CategoryModule],
})
export class FrontendSettingModule {}
