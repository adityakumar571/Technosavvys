import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// YOUR LAPTOP WIFI IP
const API_BASE_URL = 'https://technosavvys.onrender.com/api';

export const SOCKET_URL = 'http://10.0.2.2:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }

    return Promise.reject(error);
  },
);

export default api;