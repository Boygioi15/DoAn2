import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { timeStamp } from 'console';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly appService: AppService) {}
  catch(httpException: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const stt = httpException.getStatus();

    res.status(stt).json({
      statusCode: stt,
      path: req.url,
      timeStamp: new Date().toISOString(),
      message: 'Hello, this error is created from the customExceptionFIlter',
      messageForDI: this.appService.getHello(),
    });
  }
}
