import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe as CustomValidationPipe } from './configs/validation.pipe';
import dotenv from 'dotenv';

import { HttpService } from '@nestjs/axios';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  //origin: ['http://localhost:1208', 'http://localhost:1209'],
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
