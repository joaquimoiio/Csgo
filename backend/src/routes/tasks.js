const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/database');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    let query = 'SELECT * FROM user_tasks WHERE user_id = $1';
    let params = [userId];
    
    if (month && year) {
      query += ' AND EXTRACT(MONTH FROM task_date) = $2 AND EXTRACT(YEAR FROM task_date) = $3';
      params.push(month, year);
    }
    
    query += ' ORDER BY task_date DESC';
    
    const result = await db.query(query, params);
    
    const tasks = result.rows.map(row => ({
      id: row.id,
      taskType: row.task_type,
      taskDate: row.task_date,
      completed: row.completed,
      completedAt: row.completed_at,
      createdAt: row.created_at
    }));
    
    res.json({ data: tasks });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskType, taskDate, completed = true } = req.body;
    
    if (!taskType || !taskDate) {
      return res.status(400).json({ error: 'Tipo de tarefa e data são obrigatórios' });
    }
    
    if (!['daily', 'weekly'].includes(taskType)) {
      return res.status(400).json({ error: 'Tipo de tarefa inválido' });
    }
    
    // Primeiro verificar se já existe
    const existingQuery = 'SELECT * FROM user_tasks WHERE user_id = $1 AND task_type = $2 AND task_date = $3';
    const existingResult = await db.query(existingQuery, [userId, taskType, taskDate]);
    
    let query, values, task;
    
    if (existingResult.rows.length > 0) {
      // Atualizar registro existente - alternar estado
      const currentCompleted = existingResult.rows[0].completed;
      const newCompleted = !currentCompleted;
      
      query = `
        UPDATE user_tasks 
        SET completed = $1, completed_at = CASE WHEN $1 THEN NOW() ELSE NULL END
        WHERE user_id = $2 AND task_type = $3 AND task_date = $4
        RETURNING *
      `;
      values = [newCompleted, userId, taskType, taskDate];
    } else {
      // Criar novo registro
      query = `
        INSERT INTO user_tasks (user_id, task_type, task_date, completed, completed_at) 
        VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN NOW() ELSE NULL END)
        RETURNING *
      `;
      values = [userId, taskType, taskDate, completed];
    }
    
    const result = await db.query(query, values);
    task = result.rows[0];
    
    res.json({
      id: task.id,
      taskType: task.task_type,
      taskDate: task.task_date,
      completed: task.completed,
      completedAt: task.completed_at,
      message: task.completed ? 'Tarefa marcada como concluída' : 'Tarefa desmarcada'
    });
  } catch (error) {
    console.error('Erro ao processar tarefa:', error);
    res.status(500).json({ error: 'Erro ao processar tarefa' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { completed } = req.body;
    
    const checkQuery = 'SELECT id FROM user_tasks WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [taskId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    
    const query = `
      UPDATE user_tasks 
      SET completed = $1, completed_at = CASE WHEN $1 THEN NOW() ELSE NULL END
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [completed, taskId, userId]);
    const task = result.rows[0];
    
    res.json({
      id: task.id,
      taskType: task.task_type,
      taskDate: task.task_date,
      completed: task.completed,
      completedAt: task.completed_at,
      message: 'Tarefa atualizada'
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

module.exports = router;