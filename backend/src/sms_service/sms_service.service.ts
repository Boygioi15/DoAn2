import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data'; // npm install form-data
import { response } from 'express';

@Injectable()
export class SmsServiceService {
  constructor(private readonly httpService: HttpService) {}
  async sendOtp(phone: string, otp: string) {
    const url = process.env.SMS_GateWay_URL ?? 'http://172.16.0.176:8080/send'; // your SMS API endpoint

    const form = new FormData();
    form.append('to', phone);
    form.append('msg', `Your OTP code is ${otp}.`);

    const headers = form.getHeaders(); // form-data will generate correct Content-Type

    const response = await firstValueFrom(
      this.httpService.post(url, form, { headers }),
    );
    return response.data;
  }
}
