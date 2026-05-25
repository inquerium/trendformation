import api from './axiosInstance.js';

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDashboardCorrelations = (params) =>
  api.get('/dashboard/correlations', { params });
