import { axiosClient_Backend } from './apiClient';

const authApi = {
  checkPhoneSignUpCondition: async (phone) => {
    return await axiosClient_Backend.get(
      '/auth/check-phone-sign-up-condition',
      {
        params: { phone },
      }
    );
  },
  sendOtpPhone: async (identifier) => {
    console.log('Phone2', identifier);
    return await axiosClient_Backend.post(
      '/auth/send-otp',
      {},
      {
        params: { identifier },
      }
    );
  },
  register_VerifyOtpPhone: async (phone, otp) => {
    return await axiosClient_Backend.post('/auth/register-verify-otp-phone', {
      phone,
      otp,
    });
  },
  updateUserPassword: async ({
    oldPassword,
    newPassword,
    confirmNewPassword,
  }) => {
    return await axiosClient_Backend.post('/auth/update-password', {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
  },
  checkPhoneSignInCondition: async (phone) => {
    return await axiosClient_Backend.get(
      '/auth/check-phone-sign-in-condition',
      {
        params: { phone },
      }
    );
  },
  authenticateUser_Otp: async (identifier, otp) => {
    return await axiosClient_Backend.post('/auth/authenticate-user/otp', {
      identifier,
      otp,
    });
  },
  authenticateUser_AccountPassword: async (username, password) => {
    return await axiosClient_Backend.post(
      '/auth/authenticate-user/account-password',
      {
        username,
        password,
      }
    );
  },
};
export default authApi;
