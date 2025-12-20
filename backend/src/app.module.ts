import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './configs/exceptionFilter';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { SmsServiceModule } from './sms_service/sms_service.module';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FrontendSettingModule } from './frontend-setting/frontend-setting.module';
import { CartModule } from './cart/cart.module';
import { TransactionModule } from './transaction/transaction.module';
import { EmailModule } from './email/email.module';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SpeechModule } from './speech/speech.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://user:pass@localhost:27019/database?directConnection=true&authSource=admin',
    ),
    ScheduleModule.forRoot(),
    DatabaseModule,
    HttpModule.register({
      timeout: Number(process.env.HTTP_TimeOut ?? 5000),
      maxRedirects: Number(process.env.HTTP_MaxRedirect ?? 5),
    }),
    SmsServiceModule,
    UserModule,
    ProductModule,
    CategoryModule,
    CloudinaryModule,
    FrontendSettingModule,
    CartModule,
    TransactionModule,
    EmailModule,
    CronModule,
    SpeechModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: CustomExceptionFilter,
    // },
    AppService,
  ],
})
export class AppModule {}
