import axios from "axios";
import useAuthStore from "../contexts/zustands/AuthStore";
const baseConfig = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:1210",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
};
export const axiosClient_Backend = axios.create(baseConfig);
//logger
axiosClient_Backend.interceptors.response.use(
  (response) => {
    console.log("📥 [Response]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    /////LOGGER BLOCK!
    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timed out");
    } else if (error.response) {
      console.error("❌ [Error Response]", {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("🚨 [Error]", error);
    }

    return Promise.reject(error);
  }
);
axiosClient_Backend.interceptors.request.use((config) => {
  console.log("Request", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  return config;
});

axiosClient_Backend.interceptors.response.use(
  (response) => response,
  async (error) => {
    ////Retry JWT block
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();
    console.log("Invalid JWT - attempting to refresh access token");
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = authStore.refreshToken;
      if (!refreshToken) {
        console.log(
          "Retry refresh failed - refresh token not found! Logging out!"
        );
        error.authError = true;
        await authStore.signOut(); // clear cookie + redirect to auth page
        return Promise.reject(error);
      }
      console.log("Sending request to backend!");
      originalRequest._retry = true;

      try {
        const refreshResponse = await axiosClient_Backend.post(
          "/auth/refresh-access-token",
          {
            refreshToken: authStore.refreshToken,
          }
        );
        console.log(refreshResponse);
        const newAccessToken = refreshResponse.data.accessToken;
        console.log("Got new access token from the backend: ", newAccessToken);
        await authStore.setAccessToken(newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log("Retry original request");
        return await axiosClient_Backend(originalRequest);
      } catch (refreshError) {
        console.log("Retry refresh failed - logging out!");
        refreshError.authError = true;
        await authStore.signOut(); // clear cookie + redirect to auth page
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
//auto-attach access token
axiosClient_Backend.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const axiosClient_Public = axios.create(baseConfig);
axiosClient_Public.interceptors.response.use(
  (response) => {
    console.log("📥 [Response]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    /////LOGGER BLOCK!
    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timed out");
    } else if (error.response) {
      console.error("❌ [Error Response]", {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error("🚨 [Error]", error);
    }

    return Promise.reject(error);
  }
);
axiosClient_Public.interceptors.request.use((config) => {
  console.log("Request", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  return config;
});
