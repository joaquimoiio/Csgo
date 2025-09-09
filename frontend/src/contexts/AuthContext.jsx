import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há token salvo ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar se o token ainda é válido
      const userData = await authService.verifyToken();
      setUser(userData.user);
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      // Token inválido, remover
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login(username, password);
      
      // Salvar token no localStorage
      localStorage.setItem('authToken', response.token);
      
      // Definir usuário no estado
      setUser(response.user);
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao registrar usuário';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Tentar fazer logout no servidor
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authService.updateProfile(profileData);
      
      // Atualizar dados do usuário no estado
      setUser(prev => ({ ...prev, ...response.user }));
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
      setError(errorMessage);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authService.changePassword(currentPassword, newPassword);
      
      // Após alterar senha, fazer logout para forçar novo login
      await logout();
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao alterar senha';
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};