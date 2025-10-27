import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './exceptionFilter';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { SmsServiceModule } from './sms_service/sms_service.module';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/database'),
    DatabaseModule,
    HttpModule.register({
      timeout: Number(process.env.HTTP_TimeOut ?? 5000),
      maxRedirects: Number(process.env.HTTP_MaxRedirect ?? 5),
    }),
    SmsServiceModule,
    UserModule,
    ProductModule,
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
