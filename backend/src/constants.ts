export const auth_provider = {
  phone: 'phone',
  email: 'email',
  facebook: 'facebook',
};
export const otp_bounceback = 10; //in seconds
export const otp_ttl = 180; //in seconds;
export const refreshToken_ttl = 60 * 60; //in seconds
export const accessToken_ttl = 60 * 10;

export const slugifyOption = {
  replacement: '-', // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: false, // convert to lower case, defaults to `false`
  strict: false, // strip special characters except replacement, defaults to `false`
  locale: 'vi', // language code of the locale to use
  trim: true, // trim leading and trailing replacement chars, defaults to `true`
};
