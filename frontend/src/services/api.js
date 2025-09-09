import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      // Redirecionar para login se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Logout de todas as sessões
  logoutAll: async () => {
    const response = await api.post('/auth/logout-all');
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Obter perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Listar sessões
  getSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  // Revogar sessão específica
  revokeSession: async (sessionId) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }
};

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