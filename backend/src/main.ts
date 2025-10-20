import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from './validation.pipe';
import dotenv from 'dotenv';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  dotenv.config();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
