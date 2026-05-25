import axios from 'axios';
import api from './axiosInstance.js';

const base = import.meta.env.VITE_API_URL || '/api';
const plain = axios.create({ baseURL: base, withCredentials: true });

export const registerApi = (email, password, name) =>
  plain.post('/auth/register', { email, password, name });

export const getMeApi = () => api.get('/auth/me');

export const updateMeApi = (data) => api.patch('/auth/me', data);
