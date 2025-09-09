import api from './api';

export const tasksService = {
  getTasks: async (month, year) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const response = await api.get(`/tasks?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  },

  markTask: async (taskType, taskDate) => {
    try {
      const response = await api.post('/tasks', {
        taskType,
        taskDate
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar tarefa:', error);
      throw error;
    }
  },

  updateTask: async (taskId, completed) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        completed
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }
};