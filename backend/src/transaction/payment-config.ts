export default {
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  orderInfo: 'pay with MoMo',
  ipnUrl: process.env.MOMO_NOTIFY_URL, //chú ý: cần dùng ngrok thì momo mới post đến url này được
  requestType: 'payWithMethod',
  extraData: '',
  orderGroupId: '',
  autoCapture: true,
  lang: 'vi',
};
