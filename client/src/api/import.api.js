import api from './axiosInstance.js';

export const bulkImportApi = (category, rows) =>
  api.post('/import', { category, rows });
