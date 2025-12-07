import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html: html || text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Mã xác thực OTP - Q-Shop';
    const text = `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 3 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác thực tài khoản Q-Shop</h2>
        <p>Mã OTP của bạn là:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>Mã này có hiệu lực trong <strong>3 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động từ Q-Shop. Vui lòng không trả lời email này.</p>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }

  async sendWelcomeEmail(to: string, name?: string) {
    const subject = 'Chào mừng bạn đến với Q-Shop!';
    const text = `Xin chào ${name || 'bạn'}, Cảm ơn bạn đã đăng ký tài khoản tại Q-Shop.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Chào mừng đến với Q-Shop!</h2>
        <p>Xin chào <strong>${name || 'bạn'}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Q-Shop. Chúng tôi rất vui được phục vụ bạn!</p>
        <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi ngay hôm nay.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động từ Q-Shop.</p>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }

  async sendOrderConfirmationEmail(
    to: string,
    orderInfo: { orderId: string; totalAmount: number; items: any[] },
  ) {
    const subject = `Xác nhận đơn hàng #${orderInfo.orderId} - Q-Shop`;
    const text = `Đơn hàng #${orderInfo.orderId} của bạn đã được xác nhận. Tổng tiền: ${orderInfo.totalAmount.toLocaleString('vi-VN')}đ`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác nhận đơn hàng</h2>
        <p>Đơn hàng <strong>#${orderInfo.orderId}</strong> của bạn đã được xác nhận.</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0;">
          <p><strong>Tổng tiền:</strong> ${orderInfo.totalAmount.toLocaleString('vi-VN')}đ</p>
        </div>
        <p>Cảm ơn bạn đã mua sắm tại Q-Shop!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động từ Q-Shop.</p>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }
}
