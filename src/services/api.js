import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userEmail', response.data.email);
    }
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userEmail', response.data.email);
    }
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userEmail');
  },
  
  getToken: async () => {
    return await AsyncStorage.getItem('authToken');
  },
};

// Inventory API
export const inventoryAPI = {
  addPack: async (name, packSize, qrCode) => {
    const response = await api.post('/inventory/add-pack', {
      name,
      packSize,
      qrCode,
    });
    return response.data;
  },
  
  getPacks: async () => {
    const response = await api.get('/inventory/packs');
    return response.data;
  },
};

// Sales API
export const salesAPI = {
  startDay: async (packId, startTicketNumber) => {
    const response = await api.post('/sales/start-day', {
      packId,
      startTicketNumber,
    });
    return response.data;
  },
  
  getPreviousEndNumber: async () => {
    const response = await api.get('/sales/previous-end-number');
    return response.data;
  },
  
  closeDay: async (endTicketNumber) => {
    const response = await api.post('/sales/close-day', {
      endTicketNumber,
    });
    return response.data;
  },
  
  getTodaySale: async () => {
    const response = await api.get('/sales/today');
    return response.data;
  },
  
  getSalesHistory: async () => {
    const response = await api.get('/sales/history');
    return response.data;
  },
};

export default api;
