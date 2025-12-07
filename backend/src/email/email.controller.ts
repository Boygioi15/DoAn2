import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtGuard } from 'src/auth/strategies/jwt.strategy';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { to: string; subject: string; text: string; html?: string },
  ) {
    const { to, subject, text, html } = body;
    await this.emailService.sendEmail(to, subject, text, html);
    return { stt: 200, msg: 'Email sent successfully' };
  }

  @Post('send-otp')
  async sendOtpEmail(@Body() body: { to: string; otp: string }) {
    const { to, otp } = body;
    await this.emailService.sendOtpEmail(to, otp);
    return { stt: 200, msg: 'OTP email sent successfully' };
  }
}
