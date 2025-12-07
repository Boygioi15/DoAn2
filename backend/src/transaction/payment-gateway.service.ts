import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';
import { momoConfig } from './payment-config';
import { v4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import { CreatePaymentLinkRequest, PaymentLinkItem, PayOS } from '@payos/node';
import mongoose from 'mongoose';
const momo_endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';
const momo_notifyURL =
  'https://b3115c426f48.ngrok-free.app/transaction/callback/momo';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly cartService: CartService) {
    // this.payOS = payOSInstance;
  }
  async createPaymentLink_MOMO(
    transactionData: any,
    redirectUrl: any,
  ): Promise<any> {
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    if (!secretKey || !accessKey || !partnerCode) {
      throw new InternalServerErrorException('Không load được file .env');
    }
    console.log('S: ', secretKey);
    console.log('A: ', accessKey);
    console.log('PC: ', partnerCode);
    console.log('Conf: ', momoConfig);

    const requestId = Number(new mongoose.Types.ObjectId());
    const orderId = Number(new mongoose.Types.ObjectId());
    console.log('RID: ', requestId);
    console.log('OID: ', orderId);
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${50000}` +
      `&extraData=nothing` +
      `&ipnUrl=${momo_notifyURL}` +
      `&orderId=${orderId}` +
      `&orderInfo=${momoConfig.orderInfo}` + // MUST MATCH EXACTLY
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${momoConfig.requestType}`;

    console.log(rawSignature);
    // Create signature

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Xây dựng sàn thương mại điện tử bán quần áo',
      storeId: 'QShop',
      requestId: requestId,
      amount: 50000,
      orderId: orderId,
      orderInfo: momoConfig.orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: momo_notifyURL,
      lang: momoConfig.lang,
      requestType: momoConfig.requestType,
      autoCapture: momoConfig.autoCapture,
      signature,
      extraData: 'nothing',
    });

    // Axios request with error handling
    const result = await axios({
      method: 'POST',
      url: momo_endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    });
    return result;
  }
  async createPaymentLink_PayOS(
    transactionData: any,
    returnURL: string,
  ): Promise<any> {
    const clientID = process.env.PAYOS_CLIENTID,
      apiKey = process.env.PAYOS_API_KEY,
      checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    const payOSInstance = new PayOS({
      clientId: clientID,
      apiKey: apiKey,
      checksumKey: checksumKey,
    });
    console.log('payOSInstance', payOSInstance);

    const requestId = Math.floor(Math.random() * 1000000000);
    const orderId = 1000000000 + Math.floor(Math.random() * 8000000000);
    console.log('RID: ', requestId);
    console.log('OID: ', orderId);

    const itemList: PaymentLinkItem[] = [
      { name: 'Mì ly', quantity: 3, price: 50000 },
    ];
    console.log('Payment data: ', itemList);
    const paymentData: CreatePaymentLinkRequest = {
      orderCode: orderId,
      amount: 50000,
      items: itemList,
      description: 'Thanh toán đơn hàng',
      returnUrl: returnURL,
      cancelUrl: returnURL,
    };

    const paymentLink = await payOSInstance.paymentRequests.create(paymentData);
    console.log(paymentLink);
    return paymentLink;
  }
}
