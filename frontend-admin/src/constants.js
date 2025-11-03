export const otp_bounceback = 30; //in second
export const passwordRules = [
  {
    condition: (pStr) => pStr.length < 8,
    error: "Mật khẩu không được dưới 8 kí tự",
  },
  {
    condition: (pStr) => !/[A-Z]/.test(pStr), // no uppercase
    error: "Mật khẩu phải chứa ít nhất một kí tự viết hoa",
  },
  {
    condition: (pStr) => !/[0-9]/.test(pStr), // no number
    error: "Mật khẩu phải chứa ít nhất một chữ số",
  },
];

export const routeNameMap = {
  user: "Quản lý tài khoản",
  "account-info": "Thông tin tài khoản",
  "change-password": "Đổi mật khẩu",
  address: "Địa chỉ",
};
