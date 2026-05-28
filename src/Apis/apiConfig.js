



import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../redux/store';
import { logout } from '../redux/slices/userSlice';
import { BASE_URL } from '@env';
// ✅ Single source of truth
// const BASE_URL = 'https://api.partyhubconnect.com/';
console.log('base url=======', BASE_URL);
export const fullBaseURL = `${BASE_URL}/api`;

export const createAxiosInstance = (routeBase = '', extraHeaders = {}) => {
  const instance = axios.create({
    baseURL: `${fullBaseURL}/${routeBase}`,
    headers: {
      'Content-Type': extraHeaders['Content-Type'] || 'application/json',
      ...extraHeaders,
    },
  });

  // 🔑 Attach Token
  instance.interceptors.request.use(
    async config => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.log('Token fetch error', err);
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // 🚨 Handle Unauthorized
  instance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        console.log('🚨 Token expired or invalid');

        // 🧹 Clear storage
        await AsyncStorage.removeItem('userToken');

        // 🔄 Logout redux
        store.dispatch(logout());
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

export const createHeaders = (extraHeaders = {}) => ({
  'Content-Type': 'application/json',
  ...extraHeaders,
});
