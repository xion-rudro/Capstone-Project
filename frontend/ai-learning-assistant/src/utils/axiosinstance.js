import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const responseData = error.response.data;
      if (responseData?.error && !responseData.message) {
        responseData.message = responseData.error;
      }
      if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
      if (error.response.status === 401 && typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
