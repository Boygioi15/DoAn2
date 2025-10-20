import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(process.env.Test_env);
    return 'Hello World!';
  }
}
