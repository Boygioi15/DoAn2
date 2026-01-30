import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';
import { momoConfig } from './payment-config';
import { v4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import { CreatePaymentLinkRequest, PaymentLinkItem, PayOS } from '@payos/node';
import mongoose from 'mongoose';
import { TransactionService } from './transaction.service';
const momo_endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';
const ngrok_url = 'https://df29079992b1.ngrok-free.app';
const momo_notifyURL = `${ngrok_url}/transaction/callback/momo`;
const payos_notifyURL = `${ngrok_url}/transaction/callback/payos`;

@Injectable()
export class PaymentGatewayService {
  private readonly payOSInstance: PayOS;
  constructor(
    private readonly cartService: CartService,
    private readonly transactionService: TransactionService,
  ) {
    // const clientID = process.env.PAYOS_CLIENTID,
    //   apiKey = process.env.PAYOS_API_KEY,
    //   checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    // this.payOSInstance = new PayOS({
    //   clientId: clientID,
    //   apiKey: apiKey,
    //   checksumKey: checksumKey,
    // });
    // try {
    //   this.payOSInstance.webhooks.confirm(payos_notifyURL);
    // } catch (error) {
    //   console.log('Web hook payos không hoạt động');
    //   console.log(error);
    // }
  }
  async createPaymentLink_MOMO(
    orderCode: string,
    orderId: string,
    cashoutAmount: number,
    redirectUrl: string,
  ): Promise<any> {
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    if (!secretKey || !accessKey || !partnerCode) {
      throw new InternalServerErrorException('Không load được file .env');
    }
    // console.log('S: ', secretKey);
    // console.log('A: ', accessKey);
    // console.log('PC: ', partnerCode);
    // console.log('Conf: ', momoConfig);

    console.log('OID: ', orderCode);
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${cashoutAmount}` +
      `&extraData=${orderId}` +
      `&ipnUrl=${momo_notifyURL}` +
      `&orderId=${orderCode}` +
      `&orderInfo=${momoConfig.orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${orderCode}` +
      `&requestType=${momoConfig.requestType}`;

    // console.log(rawSignature);
    // Create signature

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Xây dựng sàn thương mại điện tử bán quần áo',
      storeId: 'QShop',
      requestId: orderCode,
      amount: cashoutAmount,
      orderId: orderCode,
      orderInfo: momoConfig.orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: momo_notifyURL,
      lang: momoConfig.lang,
      requestType: momoConfig.requestType,
      autoCapture: momoConfig.autoCapture,
      signature,
      extraData: orderId,
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
    orderCode: number,
    orderId: string,
    cashoutAmount: number,
    returnURL: string,
  ): Promise<any> {
    // console.log('payOSInstance', payOSInstance);

    // console.log('OCode: ', orderCode);

    // console.log('Payment data: ', itemList);
    const paymentData: CreatePaymentLinkRequest = {
      orderCode: orderCode,
      amount: cashoutAmount,
      description: `${orderId}`,
      returnUrl: returnURL,
      cancelUrl: returnURL,
    };

    const paymentLink =
      await this.payOSInstance.paymentRequests.create(paymentData);
    // console.log(paymentLink);
    return paymentLink;
  }
  async cancelOrder_PayOS(orderCode: number) {
    return await this.payOSInstance.paymentRequests.cancel(orderCode);
  }
  async handlePayOSCallback(req: any) {
    try {
      const webhookData = await this.payOSInstance.webhooks.verify(req.body);

      const orderId = webhookData.description.split(' ')[1];
      await this.transactionService.updateOrderState(orderId, 'success');
    } catch (error) {
      console.error('Webhook không hợp lệ:', error);
    }
  }
}
