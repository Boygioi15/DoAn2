import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';
import mongoose from 'mongoose';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test-send')
  async sendEmail(
    @Body() body: { to: string; subject: string; text: string; html?: string },
  ) {
    const { to, subject, text, html } = body;
    await this.emailService.sendEmail(to, subject, text, html);
    return { stt: 200, msg: 'Email sent successfully' };
  }
  @Post('test-send-payment-pending')
  async testSendPaymentPending(@Body() body: { to: string }) {
    const { to } = body;
    const mockOrder = {
      _id: '69412069d22ae888732253f4',
      address_name: 'Nguyễn Anh Quyền',
      address_phone: '0373865627',
      address_province_code: 56,
      address_province_name: 'Khánh Hòa',
      address_district_code: 574,
      address_district_name: 'Huyện Diên Khánh',
      address_ward_code: 22654,
      address_ward_name: 'Xã Diên Lâm',
      address_detail: '329 đường Hải Đức, phường Phương Sơn',
      payment_method: 'payos',
      payment_default_price: 529000,
      payment_cashout_price: 529000,
      payment_checked: false,
      payment_status: 'failed',
      reference_user: '3422fce1-7d22-4fcf-8ffb-29d334396f22',
      reference_address: '6e1f52cc-3aac-4c87-a67a-37dc8283d2e7',
      email: 'boygioi85@gmail.com',
      delivery_state: 'PENDING',
      createdAt: '2025-12-16T09:03:37.288Z',

      updatedAt: {
        $date: '2025-12-16T09:04:07.600Z',
      },
      __v: 0,
      payment_gateway_code: 47863895802,
      payment_url: 'https://pay.payos.vn/web/baf94cf0bb6c43d08e8f638056bf20f0',
    };
    await this.emailService.sendPaymentPendingEmail(to, mockOrder);
    return { stt: 200, msg: 'Email sent successfully' };
  }

  @Post('test-send-payment-confirm')
  async testSendPaymentSuccess(@Body() body: { to: string }) {
    const { to } = body;
    const mockOrder = {
      _id: '69412069d22ae888732253f4',
      address_name: 'Nguyễn Anh Quyền',
      address_phone: '0373865627',
      address_province_code: 56,
      address_province_name: 'Khánh Hòa',
      address_district_code: 574,
      address_district_name: 'Huyện Diên Khánh',
      address_ward_code: 22654,
      address_ward_name: 'Xã Diên Lâm',
      address_detail: '329 đường Hải Đức, phường Phương Sơn',
      payment_method: 'payos',
      payment_default_price: 529000,
      payment_cashout_price: 529000,
      payment_checked: false,
      payment_status: 'failed',
      reference_user: '3422fce1-7d22-4fcf-8ffb-29d334396f22',
      reference_address: '6e1f52cc-3aac-4c87-a67a-37dc8283d2e7',
      email: 'boygioi85@gmail.com',
      delivery_state: 'PENDING',
      createdAt: '2025-12-16T09:03:37.288Z',

      updatedAt: {
        $date: '2025-12-16T09:04:07.600Z',
      },
      __v: 0,
      payment_gateway_code: 47863895802,
      payment_url: 'https://pay.payos.vn/web/baf94cf0bb6c43d08e8f638056bf20f0',
    };
    const mockOrderDetailList = [
      {
        _id: {
          $oid: '694132ba3bc8e590d45fea7f',
        },
        orderId: new mongoose.Types.ObjectId('694132ba3bc8e590d45fea7d'),
        quantity: 1,
        unitPrice: 499000,
        cashoutPrice: 499000,
        productId: '16d43d8a-0309-49db-85a9-71e00b4369a5',
        variantId: '5f1dbd70-e57e-4e60-91c9-c9979c3c0fe9',
        product_name: 'Áo polo active nam wicking dáng suông',
        product_thumbnail:
          'https://res.cloudinary.com/ddrfocetn/image/upload/v1764170500/do-an-2/aj0lpwj1erc1owxp6m0x.webp',
        product_sku: 'W3U0BO76D2',
        variant_thumbnail:
          'https://res.cloudinary.com/ddrfocetn/image/upload/v1764170502/do-an-2/eun4anjahvhpgevpbfcl.webp',
        variant_color: 'Xanh dương SB001',
        variant_size: 'S',
        variant_sku: '7L49AK1X2H',
        createdAt: {
          $date: '2025-12-16T10:21:31.945Z',
        },
        updatedAt: {
          $date: '2025-12-16T10:21:46.123Z',
        },
        __v: 0,
      },
      {
        orderId: new mongoose.Types.ObjectId('694132ba3bc8e590d45fea7d'),
        quantity: 1,
        unitPrice: 329000,
        cashoutPrice: 329000,
        productId: '5e80119f-85ca-4ad7-a356-e219ab615ecb',
        variantId: '4fe2e2a4-1910-4660-b2cb-76b3ed4237d3',
        product_name: 'Áo polo nam form refular',
        product_thumbnail:
          'https://res.cloudinary.com/ddrfocetn/image/upload/v1764170510/do-an-2/jawdnys0jjkelwcqczrk.webp',
        product_sku: '1UP1UPELJ3',
        variant_thumbnail:
          'https://res.cloudinary.com/ddrfocetn/image/upload/v1764170511/do-an-2/mgq7ylt4wo68ayop73jw.webp',
        variant_color: 'Xám SA169',
        variant_size: 'XXL',
        variant_sku: 'DS3QQTTNIT',
        createdAt: {
          $date: '2025-12-16T10:21:35.087Z',
        },
        updatedAt: {
          $date: '2025-12-16T10:21:46.129Z',
        },
        __v: 0,
      },
    ];
    await this.emailService.sendOrderSuccessEmail(
      to,
      mockOrder,
      mockOrderDetailList,
    );
    return { stt: 200, msg: 'Email sent successfully' };
  }
  @Post('test-send-payment-failed')
  async testSendPaymentFailed(@Body() body: { to: string }) {
    const { to } = body;
    const mockOrder = {
      _id: '69412069d22ae888732253f4',
      address_name: 'Nguyễn Anh Quyền',
      address_phone: '0373865627',
      address_province_code: 56,
      address_province_name: 'Khánh Hòa',
      address_district_code: 574,
      address_district_name: 'Huyện Diên Khánh',
      address_ward_code: 22654,
      address_ward_name: 'Xã Diên Lâm',
      address_detail: '329 đường Hải Đức, phường Phương Sơn',
      payment_method: 'payos',
      payment_default_price: 529000,
      payment_cashout_price: 529000,
      payment_checked: false,
      payment_status: 'failed',
      reference_user: '3422fce1-7d22-4fcf-8ffb-29d334396f22',
      reference_address: '6e1f52cc-3aac-4c87-a67a-37dc8283d2e7',
      email: 'boygioi85@gmail.com',
      delivery_state: 'PENDING',
      createdAt: '2025-12-16T09:03:37.288Z',

      updatedAt: {
        $date: '2025-12-16T09:04:07.600Z',
      },
      __v: 0,
      payment_gateway_code: 47863895802,
      payment_url: 'https://pay.payos.vn/web/baf94cf0bb6c43d08e8f638056bf20f0',
    };
    await this.emailService.sendOrderFailedEmail(to, mockOrder);
    return { stt: 200, msg: 'Email sent successfully' };
  }
  @Post('send-otp')
  async sendOtpEmail(@Body() body: { to: string; otp: string }) {
    const { to, otp } = body;
    await this.emailService.sendOtpEmail(to, otp);
    return { stt: 200, msg: 'OTP email sent successfully' };
  }
}
