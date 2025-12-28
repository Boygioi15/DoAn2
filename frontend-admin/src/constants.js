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
  user: "Quản lý người dùng",
  "product-management": "Quản lý sản phẩm",
  "category-management": "Quản lý ngành hàng",
  "edit-product": "Thêm sản phẩm",
  "edit-product": "Chỉnh sửa sản phẩm",
};
export const slugifyOption = {
  replacement: "-", // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: true, // convert to lower case, defaults to `false`
  strict: false, // strip special characters except replacement, defaults to `false`
  locale: "vi", // language code of the locale to use
  trim: true, // trim leading and trailing replacement chars, defaults to `true`
};
