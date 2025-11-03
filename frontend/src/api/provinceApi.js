import { axiosClient_Public } from './apiClient';

const provinceApi = {
  getAllProvinces: async () => {
    return await axiosClient_Public.get(
      'https://open.oapi.vn/location/provinces?size=100'
    );
  },
  getAllDistrictOfProvince: async (provinceId) => {
    return await axiosClient_Public.get(
      `https://open.oapi.vn/location/districts/${provinceId}`
    );
  },
  getAllWardOfDistrict: async (districtId) => {
    return await axiosClient_Public.get(
      `https://open.oapi.vn/location/wards/${districtId}`
    );
  },
};
export default provinceApi;
