import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const earningsService = {
  // Buscar todos os ganhos
  getAll: () => api.get('/earnings'),
  
  // Buscar ganhos por tipo
  getByType: (type) => api.get(`/earnings/type/${type}`),
  
  // Buscar totais
  getTotals: () => api.get('/earnings/totals'),
  
  // Adicionar novo ganho
  add: (earning) => api.post('/earnings', earning),
  
  // Deletar ganho
  delete: (id) => api.delete(`/earnings/${id}`),
};

export default api;