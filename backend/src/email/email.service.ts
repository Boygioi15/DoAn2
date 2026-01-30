import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Order, OrderDetail } from 'src/database/schemas/transaction.schema';

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
      //   throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Mã xác thực OTP - SilkShop';
    const text = `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 3 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác thực tài khoản SilkShop</h2>
        <p>Mã OTP của bạn là:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>Mã này có hiệu lực trong <strong>3 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động từ SilkShop. Vui lòng không trả lời email này.</p>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }

  async sendWelcomeEmail(to: string, name?: string) {
    const subject = 'Chào mừng bạn đến với SilkShop!';
    const text = `Xin chào ${name || 'bạn'}, Cảm ơn bạn đã đăng ký tài khoản tại SilkShop.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Chào mừng đến với SilkShop!</h2>
        <p>Xin chào <strong>${name || 'bạn'}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại SilkShop. Chúng tôi rất vui được phục vụ bạn!</p>
        <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi ngay hôm nay.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động từ SilkShop.</p>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }
  // ... your existing sendEmail function ...

  async sendPaymentPendingEmail(email: string, order: Order) {
    // 1. Helpers
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    const formatDate = (date: any) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // 2. Prepare Data
    const orderId = order['_id'].toString();
    const orderDate = formatDate(order['createdAt'] || new Date());
    const fullAddress = [
      order.address_detail,
      order.address_ward_name,
      order.address_district_name,
      order.address_province_name,
    ]
      .filter(Boolean)
      .join(', ');

    // 3. Construct HTML
    const html = `
      <div style="margin:0;padding:20px 20px 50px;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif">
        <table width="100%" bgcolor="#f6f9fc" cellpadding="0" cellspacing="0" style="padding:24px 0">
            <tbody><tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff" style="border-radius:8px;max-width:600px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
                        <tbody>
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #2579f2; height:80px; padding:0;">
                                   <div style="color:white; font-size: 24px; font-weight:bold; line-height: 80px;">Silk shop</div>
                                </td>
                            </tr>
                            
                            <!-- Main Icon / Title -->
                                                       <tr>
                                <td align="center" style="padding: 30px 20px 10px 20px;">
                                    <!-- 
                                      FIX: 
                                      1. margin: 0 auto -> Centers the yellow circle box horizontally
                                      2. text-align: center -> Centers the icon horizontally inside the box
                                      3. line-height: 50px -> Centers the icon vertically (must match height)
                                    -->
                                    <div style="width: 50px; height: 50px; background: #fff3cd; border-radius: 50%; margin: 0 auto 15px auto; text-align: center; line-height: 50px;">
                                        <span style="font-size: 24px; vertical-align: middle;">⏳</span>
                                    </div>
                                    <h1 style="font-size:20px;font-weight:bold;color:#434447;margin:0;">
                                        Thanh toán đang chờ xử lý
                                    </h1>
                                </td>
                            </tr>

                            <!-- Message -->
                            <tr>
                                <td align="center" style="padding: 0 30px 20px 30px; color:#687385; font-size:15px; line-height: 1.5;">
                                    <p>Xin chào <strong>${order.address_name}</strong>,</p>
                                    <p>Đơn hàng <strong>#${orderId}</strong> của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán để chúng tôi tiến hành giao hàng ngay cho bạn.</p>
                                </td>
                            </tr>

                            <!-- Payment Button -->
                            <tr>
                                <td align="center" style="padding: 10px 30px 30px 30px;">
                                    <a href="${order.payment_url}" style="display:inline-block; background:#2579f2; color:#fff; text-decoration:none; font-weight:bold; font-size:16px; padding: 15px 40px; border-radius: 6px; box-shadow: 0 4px 10px rgba(37, 121, 242, 0.3);">
                                        Thanh toán ngay: ${formatCurrency(order.payment_cashout_price)}
                                    </a>
                                    <div style="margin-top: 10px; font-size: 12px; color: #888;">
                                        (Link thanh toán sẽ hết hạn sau ít phút)
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 24px"><div style="border-top:1px solid #e5eaf1;"></div></td>
                            </tr>

                            <!-- Order & Address Details -->
                            <tr>
                                <td style="padding:24px;">
                                    <div style="font-size:16px;color:#434447;font-weight:600;margin-bottom:15px">Thông tin giao hàng</div>
                                    
                                    <div style="background:#f8f9fa; border-radius:8px; padding:15px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#444;">
                                            <tbody>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;width:100px;">Mã đơn hàng:</td>
                                                    <td style="font-weight:600;color:#222;padding:5px 0;">#${orderId}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Ngày đặt:</td>
                                                    <td style="color:#222;padding:5px 0;">${orderDate}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Người nhận:</td>
                                                    <td style="font-weight:600;color:#222;padding:5px 0;">${order.address_name} (${order.address_phone})</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;vertical-align:top;">Địa chỉ:</td>
                                                    <td style="color:#222;padding:5px 0;line-height:1.4;">${fullAddress}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Tổng tiền:</td>
                                                    <td style="font-weight:bold;color:#ee4d2d;padding:5px 0;font-size:15px;">${formatCurrency(order.payment_cashout_price)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #eee;">
                                    <p style="margin:0; font-size:12px; color:#999;">
                                        Nếu bạn đã thanh toán, vui lòng bỏ qua email này.<br>
                                        Cần hỗ trợ? Liên hệ <a href="#" style="color:#2579f2;">CSKH SilkShop</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody></table>
      </div>
    `;

    const subject = `[Nhắc nhở] Thanh toán đơn hàng #${orderId} - SilkShop`;
    const text = `Đơn hàng #${orderId} đang chờ thanh toán. Tổng tiền: ${formatCurrency(order.payment_cashout_price)}. Vui lòng thanh toán tại: ${order.payment_url}`;

    return this.sendEmail(email, subject, text, html);
  }
  async sendOrderSuccessEmail(
    to: string,
    order: Order,
    orderDetails: OrderDetail[],
  ) {
    // 1. Helpers for formatting
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    const formatDate = (date: any) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    // 2. Prepare Data
    const orderId = order['_id'].toString(); // Short ID
    const orderDate = formatDate(order['createdAt'] || new Date());
    const fullAddress = [
      order.address_detail,
      order.address_ward_name,
      order.address_district_name,
      order.address_province_name,
    ]
      .filter(Boolean)
      .join(', ');

    // 3. Generate Product List HTML (The "Loop" Trick)
    const productRowsHtml = orderDetails
      .map((item) => {
        const imgUrl =
          item.variant_thumbnail ||
          item.product_thumbnail ||
          'https://via.placeholder.com/60';
        const totalPrice = formatCurrency(item.unitPrice * item.quantity);

        // Optional: Render variant info only if it exists
        const variantInfo = [
          item.variant_color ? `Màu: ${item.variant_color}` : '',
          item.variant_size ? `Size: ${item.variant_size}` : '',
        ]
          .filter(Boolean)
          .join(' | ');

        return `
        <tr>
            <td style="vertical-align:top;width:60px;padding-bottom:15px;">
                <img src="${imgUrl}" alt="Product" width="60" style="border-radius:8px; border: 1px solid #eee; display:block;">
            </td>
            <td style="padding-left:15px;vertical-align:top;padding-bottom:15px;">
                <div style="font-size:14px;font-weight:600;color:#434447;margin-bottom:4px">
                    ${item.product_name}
                </div>
                <div style="color:#687385;font-size:12px;margin-bottom:4px">
                    ${variantInfo ? variantInfo + ' | ' : ''} SL: ${item.quantity}
                </div>
            </td>
            <td style="text-align:right;vertical-align:top;white-space:nowrap;padding-bottom:15px;">
                <div style="font-size:14px;font-weight:600;color:#434447;">${totalPrice}</div>
            </td>
        </tr>
      `;
      })
      .join(''); // <--- IMPORTANT: Join the array into a single string

    // 4. Construct the Main HTML
    const html = `
      <div style="margin:0;padding:20px 20px 50px;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif">
        <table width="100%" bgcolor="#f6f9fc" cellpadding="0" cellspacing="0" style="padding:24px 0">
            <tbody><tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff" style="border-radius:8px;max-width:628px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
                        <tbody>
                            <!-- Header Image -->
                            <tr>
                                <td align="center" style="background-color: #2579f2; height:100px; padding:0;">
                                   <!-- Replace with your banner -->
                                   <div style="color:white; font-size: 24px; font-weight:bold; line-height: 100px;">Silk Shop</div>
                                </td>
                            </tr>
                            
                            <!-- Title -->
                            <tr>
                                <td align="center" style="padding: 20px 0 8px 0;">
                                    <h1 style="font-size:20px;font-weight:bold;color:#434447;margin:0;">
                                        Đơn hàng mới #${orderId}
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="color:#687385;font-weight:600;font-size:13px;padding-bottom:16px">
                                    Cảm ơn bạn đã đặt hàng tại SilkShop.
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 24px"><div style="border-top:1px solid #e5eaf1;margin-top:8px"></div></td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding:24px;font-size:16px;color:#222">
                                    <p style="margin:0 0 8px 0;font-size:15px;color:#424347;font-weight:500;">Xin chào, ${order.address_name}</p>
                                    <p style="margin:0 0 20px 0;font-size:15px;color:#424347;font-weight:500;">Đơn hàng của bạn đã được tiếp nhận và đang xử lý.</p>
                                    
                                    <a href="${order.payment_url || '#'}" style="display:block;width:100%;margin:0 auto 24px auto;background:#2579f2;color:#fff;text-align:center;border-radius:8px;padding:12px 0;text-decoration:none;font-weight:600;font-size:15px">
                                        Xem chi tiết đơn hàng
                                    </a>

                                    <!-- Order Info Box -->
                                    <div style="font-size:18px;color:#424347;font-weight:600;margin-bottom:20px">
                                        Thông tin đơn hàng
                                        <span style="margin-left:10px;font-size:13px;font-weight:600;color:#424347;border:1px solid #2579f2;border-radius:4px;padding:2px 4px;display:inline-block">
                                            Ngày ${orderDate}
                                        </span>
                                    </div>

                                    <div style="background:#fff;border-radius:4px;border:1px solid #e3eeff;padding:8px 12px;margin-bottom:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#444;">
                                            <tbody>
                                                <tr>
                                                    <td style="width:110px;color:#687385;padding:4px 0">Khách hàng</td>
                                                    <td style="color:#434447;font-weight:500;padding:4px 0">${order.address_name}</td>
                                                    <td style="width:110px;color:#687385;padding:4px 0">Thanh toán</td>
                                                    <td style="color:#434447;padding:4px 0">${order.payment_method}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:4px 0">Email</td>
                                                    <td style="color:#434447;font-weight:500;padding:4px 0">${order.email}</td>
                                                    <td style="color:#687385;padding:4px 0">Trạng thái</td>
                                                    <td style="padding:4px 0; font-weight:600; color:#2579f2;">${order.payment_state}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:4px 0">SĐT</td>
                                                    <td style="color:#434447;font-weight:500;padding:4px 0">${order.address_phone}</td>
                                                    <td style="color:#687385;padding:4px 0">Địa chỉ</td>
                                                    <td style="color:#434447;padding:4px 0">${fullAddress}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style="font-size:18px;color:#434447;font-weight:600;margin-bottom:20px">Chi tiết sản phẩm</div>
                                    
                                    <!-- Product Table -->
                                    <div>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#444;border-collapse:collapse">
                                            <tbody>
                                                ${productRowsHtml} <!-- Injecting the loop here -->
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- Totals -->
                                    <div style="margin-top:10px">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#444;">
                                            <tbody>
                                                <tr><td colspan="2" style="border-top:1px solid #e6f2ff;height:10px;"></td></tr>
                                                <tr>
                                                    <td style="color:#687385;font-size:13px;font-weight:500;text-align:right;padding:5px 0;">Tổng giá trị</td>
                                                    <td style="color:#434447;font-size:13px;font-weight:500;text-align:right;width:120px;padding:5px 0;">
                                                        ${formatCurrency(order.payment_cashout_price)}
                                                    </td>
                                                </tr>
                                                <tr><td colspan="2"><div style="background:#e6f2ff;height:1px;margin:10px 0"></div></td></tr>
                                                <tr>
                                                    <td style="color:#687385;font-size:15px;font-weight:600;text-align:right;">Tổng thanh toán</td>
                                                    <td style="color:#2579f2;font-size:16px;font-weight:700;text-align:right;width:120px;">
                                                        ${formatCurrency(order.payment_cashout_price)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div style="margin-top: 30px;">
                                        <a href="https://your-website.com" style="display:block;width:100%;background:#e4efff;color:#2579f2;text-align:center;border-radius:4px;padding:12px 0;text-decoration:none;font-weight:600;font-size:15px">
                                            Tiếp tục mua sắm
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody></table>
        <div style="text-align:center;color:#687385;font-size:13px;margin-top:20px;">
            <p>Email này được gửi tự động từ SilkShop. Vui lòng không trả lời.</p>
        </div>
      </div>
    `;

    const subject = `Xác nhận đơn hàng #${orderId}`;
    const text = `Cảm ơn bạn đã đặt hàng. Mã đơn hàng: ${orderId}. Tổng tiền: ${formatCurrency(order.payment_cashout_price)}`;

    return this.sendEmail(to, subject, text, html);
  }
  async sendOrderFailedEmail(email: string, order: Order) {
    // 1. Helpers
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    const formatDate = (date: any) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // 2. Prepare Data
    const orderId = order['_id'].toString();
    const orderDate = formatDate(order['createdAt'] || new Date());
    const fullAddress = [
      order.address_detail,
      order.address_ward_name,
      order.address_district_name,
      order.address_province_name,
    ]
      .filter(Boolean)
      .join(', ');

    // 3. Construct HTML
    const html = `
      <div style="margin:0;padding:20px 20px 50px;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif">
        <table width="100%" bgcolor="#f6f9fc" cellpadding="0" cellspacing="0" style="padding:24px 0">
            <tbody><tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff" style="border-radius:8px;max-width:600px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
                        <tbody>
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #2579f2; height:80px; padding:0;">
                                   <div style="color:white; font-size: 24px; font-weight:bold; line-height: 80px;">SilkShop</div>
                                </td>
                            </tr>
                            
                            <!-- Main Icon / Title (Red Theme) -->
                            <tr>
                                <td align="center" style="padding: 30px 20px 10px 20px;">
                                    <!-- Centered Red Circle with X -->
                                    <div style="width: 50px; height: 50px; background: #ffe6e6; border-radius: 50%; margin: 0 auto 15px auto; text-align: center; line-height: 50px;">
                                        <span style="font-size: 24px; color: #dc3545;">✕</span>
                                    </div>
                                    <h1 style="font-size:20px;font-weight:bold;color:#dc3545;margin:0;">
                                        Thanh toán thất bại
                                    </h1>
                                </td>
                            </tr>

                            <!-- Message -->
                            <tr>
                                <td align="center" style="padding: 0 30px 20px 30px; color:#687385; font-size:15px; line-height: 1.5;">
                                    <p>Xin chào <strong>${order.address_name}</strong>,</p>
                                    <p>Rất tiếc, giao dịch thanh toán cho đơn hàng <strong>#${orderId}</strong> chưa thành công hoặc đã bị hủy.</p>
                                    <p style="font-size: 13px; color: #888;">(Nếu tài khoản của bạn đã bị trừ tiền, vui lòng liên hệ ngay với bộ phận CSKH để được hoàn tiền).</p>
                                </td>
                            </tr>

                            <!-- Retry Button (Red/Orange) -->
                            <tr>
                                <td align="center" style="padding: 10px 30px 30px 30px;">
                                    <a href="${order.payment_url}" style="display:inline-block; background:#dc3545; color:#fff; text-decoration:none; font-weight:bold; font-size:16px; padding: 15px 40px; border-radius: 6px; box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);">
                                        Thử lại / Thanh toán lại
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:0 24px"><div style="border-top:1px solid #e5eaf1;"></div></td>
                            </tr>

                            <!-- Order Details -->
                            <tr>
                                <td style="padding:24px;">
                                    <div style="font-size:16px;color:#434447;font-weight:600;margin-bottom:15px">Thông tin đơn hàng</div>
                                    
                                    <div style="background:#f8f9fa; border-radius:8px; padding:15px; border-left: 4px solid #dc3545;">
                                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#444;">
                                            <tbody>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;width:100px;">Mã đơn hàng:</td>
                                                    <td style="font-weight:600;color:#222;padding:5px 0;">#${orderId}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Ngày đặt:</td>
                                                    <td style="color:#222;padding:5px 0;">${orderDate}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Trạng thái:</td>
                                                    <td style="font-weight:bold;color:#dc3545;padding:5px 0;">Đã hủy / Thất bại</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#687385;padding:5px 0;">Tổng tiền:</td>
                                                    <td style="font-weight:bold;color:#222;padding:5px 0;">${formatCurrency(order.payment_cashout_price)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="padding: 20px; background-color: #f8f9fa; border-top: 1px solid #eee;">
                                    <p style="margin:0; font-size:12px; color:#999;">
                                        Email này được gửi tự động từ SilkShop.<br>
                                        Cần hỗ trợ? Liên hệ <a href="#" style="color:#2579f2;">CSKH SilkShop</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody></table>
      </div>
    `;

    const subject = `[Thông báo] Thanh toán thất bại đơn hàng #${orderId} - SilkShop`;
    const text = `Giao dịch cho đơn hàng #${orderId} đã thất bại. Vui lòng thử lại.`;

    return this.sendEmail(email, subject, text, html);
  }
}
